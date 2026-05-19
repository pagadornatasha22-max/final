import express from "express";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ limit: "25mb" }));

// CORS for local Vite frontend and Render-hosted frontend.
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// Database pool configuration for Aiven MySQL.
// Supports both MYSQL_* variables and the older DB_* variables.
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || process.env.DB_HOST,
  user: process.env.MYSQL_USER || process.env.DB_USER,
  password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD,
  database: process.env.MYSQL_DATABASE || process.env.DB_NAME,
  port: Number(process.env.MYSQL_PORT || process.env.DB_PORT) || 3306,
  ssl: {
    rejectUnauthorized: false, // Required for Aiven SSL communication.
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ---------- Helpers ----------
const mapUser = (row) => ({
  id: String(row.id),
  fullName: row.full_name,
  email: row.email,
  username: row.username,
  contactNumber: row.contact_number,
  address: row.address || "",
  password: row.password,
  role: row.role,
  createdAt: row.created_at,
});

const mapProduct = (row) => ({
  id: String(row.id),
  name: row.name,
  price: Number(row.price),
  category: row.category,
  description: row.description || "",
  image: row.image || "/images/bouquet1.jpg",
  inStock: Boolean(row.in_stock),
  createdAt: row.created_at,
});

const generateOrderNumber = () => {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  return `MFS-${yy}${mm}${dd}-${rand}`;
};

const mapOrder = async (row) => {
  const [items] = await pool.query("SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC", [row.id]);
  const [reviews] = await pool.query("SELECT * FROM reviews WHERE order_id = ? LIMIT 1", [row.id]);

  const order = {
    id: String(row.id),
    orderNumber: row.order_number,
    customerId: String(row.customer_id),
    customerName: row.customer_name,
    contactNumber: row.contact_number,
    email: row.email,
    items: items.map((item) => ({
      product: {
        id: String(item.product_id),
        name: item.product_name,
        price: Number(item.product_price),
        category: "bouquet",
        description: "",
        image: item.product_image || "/images/bouquet1.jpg",
        inStock: true,
        createdAt: item.created_at,
      },
      quantity: Number(item.quantity),
    })),
    totalAmount: Number(row.total_amount),
    pickupDate: row.pickup_date,
    pickupTime: row.pickup_time,
    messageCard: row.message_card || "",
    paymentMethod: row.payment_method,
    gcashRefNumber: row.gcash_ref_number || undefined,
    gcashReceiptImage: row.gcash_receipt_image || undefined,
    paymentStatus: row.payment_status || "pending",
    isCustomOrder: Boolean(row.is_custom_order),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    review: reviews[0]
      ? {
          rating: Number(reviews[0].rating),
          comment: reviews[0].comment || "",
          createdAt: reviews[0].created_at,
        }
      : undefined,
  };

  if (row.is_custom_order) {
    const [customRows] = await pool.query("SELECT * FROM custom_arrangements WHERE order_id = ? LIMIT 1", [row.id]);
    if (customRows.length) {
      const custom = customRows[0];
      const [flowers] = await pool.query("SELECT flower_type FROM custom_arrangement_flowers WHERE custom_arrangement_id = ?", [custom.id]);
      const [colors] = await pool.query("SELECT color FROM custom_arrangement_colors WHERE custom_arrangement_id = ?", [custom.id]);
      const [images] = await pool.query("SELECT image_data FROM custom_arrangement_images WHERE custom_arrangement_id = ? ORDER BY sort_order ASC", [custom.id]);

      order.customArrangement = {
        description: custom.description || "",
        flowerTypes: flowers.map((f) => f.flower_type),
        colors: colors.map((c) => c.color),
        style: custom.style,
        occasion: custom.occasion,
        budgetMin: Number(custom.budget_min),
        budgetMax: Number(custom.budget_max),
        referenceImages: images.map((i) => i.image_data),
        additionalNotes: custom.additional_notes || "",
      };
    }
  }

  return order;
};

const asyncHandler = (handler) => async (req, res, next) => {
  try {
    await handler(req, res, next);
  } catch (err) {
    next(err);
  }
};

// ---------- Health ----------
app.get("/api/health", asyncHandler(async (_req, res) => {
  await pool.query("SELECT 1");
  res.json({ ok: true, database: "connected", service: "Macel's Flower Shop API" });
}));

// ---------- AUTH / ACCOUNTS API ----------
app.post("/api/auth/login", asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE (email = ? OR username = ?) AND password = ? LIMIT 1",
    [identifier, identifier, password]
  );

  if (!rows.length) return res.status(401).json({ success: false, message: "Invalid credentials" });
  res.json(mapUser(rows[0]));
}));

// Alias to match the sample style.
app.post("/api/login", asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const [rows] = await pool.query(
    "SELECT * FROM users WHERE (username = ? OR email = ?) AND password = ? LIMIT 1",
    [username, username, password]
  );

  if (!rows.length) return res.status(401).json({ success: false, message: "Invalid credentials" });
  res.json({ success: true, user: mapUser(rows[0]) });
}));

app.post("/api/auth/register", asyncHandler(async (req, res) => {
  const { fullName, email, username, contactNumber, address, password } = req.body;
  const [existing] = await pool.query("SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1", [email, username]);
  if (existing.length) return res.status(409).json({ message: "Email or username already exists." });

  const [result] = await pool.query(
    `INSERT INTO users (full_name, email, username, contact_number, address, password, role)
     VALUES (?, ?, ?, ?, ?, ?, 'customer')`,
    [fullName, email, username, contactNumber, address, password]
  );

  const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [result.insertId]);
  res.status(201).json(mapUser(rows[0]));
}));

// ---------- USERS TABLE API ----------
app.get("/api/users", asyncHandler(async (_req, res) => {
  const [rows] = await pool.query("SELECT * FROM users ORDER BY created_at DESC");
  res.json(rows.map(mapUser));
}));

app.get("/api/customers", asyncHandler(async (_req, res) => {
  const [rows] = await pool.query("SELECT * FROM users WHERE role = 'customer' ORDER BY created_at DESC");
  res.json(rows.map(mapUser));
}));

app.get("/api/users/:id", asyncHandler(async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: "User not found" });
  res.json(mapUser(rows[0]));
}));

app.put("/api/users/:id", asyncHandler(async (req, res) => {
  const { fullName, email, username, contactNumber, address, password, role } = req.body;
  await pool.query(
    `UPDATE users
     SET full_name = ?, email = ?, username = ?, contact_number = ?, address = ?, password = ?, role = ?
     WHERE id = ?`,
    [fullName, email, username, contactNumber, address, password, role, req.params.id]
  );

  const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: "User not found" });
  res.json(mapUser(rows[0]));
}));

app.delete("/api/users/:id", asyncHandler(async (req, res) => {
  await pool.query("DELETE FROM users WHERE id = ?", [req.params.id]);
  res.json({ success: true });
}));

// ---------- PRODUCTS TABLE API / MENU ITEMS ----------
app.get("/api/products", asyncHandler(async (_req, res) => {
  const [rows] = await pool.query("SELECT * FROM products ORDER BY id ASC");
  res.json(rows.map(mapProduct));
}));

// Alias: menu items shown to customer are product records from database.
app.get("/api/menu", asyncHandler(async (_req, res) => {
  const [rows] = await pool.query("SELECT * FROM products WHERE in_stock = 1 ORDER BY id ASC");
  res.json(rows.map(mapProduct));
}));

app.get("/api/products/:id", asyncHandler(async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: "Product not found" });
  res.json(mapProduct(rows[0]));
}));

app.post("/api/products", asyncHandler(async (req, res) => {
  const { name, price, category, description, image, inStock } = req.body;
  const [result] = await pool.query(
    `INSERT INTO products (name, price, category, description, image, in_stock)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, Number(price), category, description, image, inStock ? 1 : 0]
  );

  const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [result.insertId]);
  res.status(201).json(mapProduct(rows[0]));
}));

app.put("/api/products/:id", asyncHandler(async (req, res) => {
  const { name, price, category, description, image, inStock } = req.body;
  await pool.query(
    `UPDATE products
     SET name = ?, price = ?, category = ?, description = ?, image = ?, in_stock = ?
     WHERE id = ?`,
    [name, Number(price), category, description, image, inStock ? 1 : 0, req.params.id]
  );

  const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: "Product not found" });
  res.json(mapProduct(rows[0]));
}));

app.delete("/api/products/:id", asyncHandler(async (req, res) => {
  await pool.query("DELETE FROM products WHERE id = ?", [req.params.id]);
  res.json({ success: true });
}));

// ---------- ORDERS TABLE API ----------
app.get("/api/orders", asyncHandler(async (_req, res) => {
  const [rows] = await pool.query("SELECT * FROM orders ORDER BY created_at DESC");
  res.json(await Promise.all(rows.map(mapOrder)));
}));

app.get("/api/orders/customer/:customerId", asyncHandler(async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC", [req.params.customerId]);
  res.json(await Promise.all(rows.map(mapOrder)));
}));

app.get("/api/orders/:id", asyncHandler(async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM orders WHERE id = ?", [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: "Order not found" });
  res.json(await mapOrder(rows[0]));
}));

app.post("/api/orders", asyncHandler(async (req, res) => {
  const data = req.body;
  const orderNumber = generateOrderNumber();
  const isCustom = data.isCustomOrder ? 1 : 0;

  const [result] = await pool.query(
    `INSERT INTO orders
     (order_number, customer_id, customer_name, contact_number, email, total_amount, pickup_date, pickup_time,
      message_card, payment_method, gcash_ref_number, gcash_receipt_image, payment_status, is_custom_order, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'gcash', ?, ?, 'pending', ?, 'pending')`,
    [
      orderNumber,
      Number(data.customerId),
      data.customerName,
      data.contactNumber,
      data.email,
      Number(data.totalAmount || 0),
      data.pickupDate,
      data.pickupTime,
      data.messageCard || "",
      data.gcashRefNumber || null,
      data.gcashReceiptImage || null,
      isCustom,
    ]
  );

  const orderId = result.insertId;

  for (const item of data.items || []) {
    await pool.query(
      `INSERT INTO order_items (order_id, product_id, product_name, product_price, product_image, quantity)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [orderId, Number(item.product.id), item.product.name, Number(item.product.price), item.product.image, Number(item.quantity)]
    );
  }

  if (data.customArrangement) {
    const ca = data.customArrangement;
    const [customResult] = await pool.query(
      `INSERT INTO custom_arrangements (order_id, description, style, occasion, budget_min, budget_max, additional_notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [orderId, ca.description, ca.style, ca.occasion, Number(ca.budgetMin), Number(ca.budgetMax), ca.additionalNotes || ""]
    );

    const customId = customResult.insertId;

    for (const flower of ca.flowerTypes || []) {
      await pool.query("INSERT INTO custom_arrangement_flowers (custom_arrangement_id, flower_type) VALUES (?, ?)", [customId, flower]);
    }

    for (const color of ca.colors || []) {
      await pool.query("INSERT INTO custom_arrangement_colors (custom_arrangement_id, color) VALUES (?, ?)", [customId, color]);
    }

    for (const [index, image] of (ca.referenceImages || []).entries()) {
      await pool.query("INSERT INTO custom_arrangement_images (custom_arrangement_id, image_data, sort_order) VALUES (?, ?, ?)", [customId, image, index]);
    }
  }

  const [rows] = await pool.query("SELECT * FROM orders WHERE id = ?", [orderId]);
  res.status(201).json(await mapOrder(rows[0]));
}));

app.put("/api/orders/:id/status", asyncHandler(async (req, res) => {
  await pool.query("UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?", [req.body.status, req.params.id]);
  const [rows] = await pool.query("SELECT * FROM orders WHERE id = ?", [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: "Order not found" });
  res.json(await mapOrder(rows[0]));
}));

app.put("/api/orders/:id/payment-status", asyncHandler(async (req, res) => {
  await pool.query("UPDATE orders SET payment_status = ?, updated_at = NOW() WHERE id = ?", [req.body.paymentStatus, req.params.id]);
  const [rows] = await pool.query("SELECT * FROM orders WHERE id = ?", [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: "Order not found" });
  res.json(await mapOrder(rows[0]));
}));

app.delete("/api/orders/:id", asyncHandler(async (req, res) => {
  await pool.query("DELETE FROM orders WHERE id = ?", [req.params.id]);
  res.json({ success: true });
}));

// ---------- ORDER_ITEMS TABLE API ----------
app.get("/api/order-items", asyncHandler(async (_req, res) => {
  const [rows] = await pool.query("SELECT * FROM order_items ORDER BY id DESC");
  res.json(rows);
}));

app.get("/api/order-items/order/:orderId", asyncHandler(async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM order_items WHERE order_id = ?", [req.params.orderId]);
  res.json(rows);
}));

app.post("/api/order-items", asyncHandler(async (req, res) => {
  const { orderId, productId, productName, productPrice, productImage, quantity } = req.body;
  const [result] = await pool.query(
    `INSERT INTO order_items (order_id, product_id, product_name, product_price, product_image, quantity)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [orderId, productId, productName, productPrice, productImage, quantity]
  );
  const [rows] = await pool.query("SELECT * FROM order_items WHERE id = ?", [result.insertId]);
  res.status(201).json(rows[0]);
}));

app.put("/api/order-items/:id", asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  await pool.query("UPDATE order_items SET quantity = ? WHERE id = ?", [quantity, req.params.id]);
  const [rows] = await pool.query("SELECT * FROM order_items WHERE id = ?", [req.params.id]);
  res.json(rows[0]);
}));

app.delete("/api/order-items/:id", asyncHandler(async (req, res) => {
  await pool.query("DELETE FROM order_items WHERE id = ?", [req.params.id]);
  res.json({ success: true });
}));

// ---------- CUSTOM ARRANGEMENTS TABLE API ----------
app.get("/api/custom-arrangements", asyncHandler(async (_req, res) => {
  const [rows] = await pool.query("SELECT * FROM custom_arrangements ORDER BY id DESC");
  res.json(rows);
}));

app.get("/api/custom-arrangements/:id", asyncHandler(async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM custom_arrangements WHERE id = ?", [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: "Custom arrangement not found" });
  res.json(rows[0]);
}));

app.get("/api/custom-arrangements/order/:orderId", asyncHandler(async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM custom_arrangements WHERE order_id = ?", [req.params.orderId]);
  res.json(rows[0] || null);
}));

app.post("/api/custom-arrangements", asyncHandler(async (req, res) => {
  const { orderId, description, style, occasion, budgetMin, budgetMax, additionalNotes } = req.body;
  const [result] = await pool.query(
    `INSERT INTO custom_arrangements (order_id, description, style, occasion, budget_min, budget_max, additional_notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [orderId, description, style, occasion, budgetMin, budgetMax, additionalNotes]
  );
  const [rows] = await pool.query("SELECT * FROM custom_arrangements WHERE id = ?", [result.insertId]);
  res.status(201).json(rows[0]);
}));

app.put("/api/custom-arrangements/:id", asyncHandler(async (req, res) => {
  const { description, style, occasion, budgetMin, budgetMax, additionalNotes } = req.body;
  await pool.query(
    `UPDATE custom_arrangements
     SET description = ?, style = ?, occasion = ?, budget_min = ?, budget_max = ?, additional_notes = ?
     WHERE id = ?`,
    [description, style, occasion, budgetMin, budgetMax, additionalNotes, req.params.id]
  );
  const [rows] = await pool.query("SELECT * FROM custom_arrangements WHERE id = ?", [req.params.id]);
  res.json(rows[0]);
}));

app.delete("/api/custom-arrangements/:id", asyncHandler(async (req, res) => {
  await pool.query("DELETE FROM custom_arrangements WHERE id = ?", [req.params.id]);
  res.json({ success: true });
}));

// ---------- CUSTOM ARRANGEMENT FLOWERS TABLE API ----------
app.get("/api/custom-arrangement-flowers/:customArrangementId", asyncHandler(async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM custom_arrangement_flowers WHERE custom_arrangement_id = ?", [req.params.customArrangementId]);
  res.json(rows);
}));

app.post("/api/custom-arrangement-flowers", asyncHandler(async (req, res) => {
  const { customArrangementId, flowerType } = req.body;
  const [result] = await pool.query(
    "INSERT INTO custom_arrangement_flowers (custom_arrangement_id, flower_type) VALUES (?, ?)",
    [customArrangementId, flowerType]
  );
  const [rows] = await pool.query("SELECT * FROM custom_arrangement_flowers WHERE id = ?", [result.insertId]);
  res.status(201).json(rows[0]);
}));

app.delete("/api/custom-arrangement-flowers/:id", asyncHandler(async (req, res) => {
  await pool.query("DELETE FROM custom_arrangement_flowers WHERE id = ?", [req.params.id]);
  res.json({ success: true });
}));

// ---------- CUSTOM ARRANGEMENT COLORS TABLE API ----------
app.get("/api/custom-arrangement-colors/:customArrangementId", asyncHandler(async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM custom_arrangement_colors WHERE custom_arrangement_id = ?", [req.params.customArrangementId]);
  res.json(rows);
}));

app.post("/api/custom-arrangement-colors", asyncHandler(async (req, res) => {
  const { customArrangementId, color } = req.body;
  const [result] = await pool.query(
    "INSERT INTO custom_arrangement_colors (custom_arrangement_id, color) VALUES (?, ?)",
    [customArrangementId, color]
  );
  const [rows] = await pool.query("SELECT * FROM custom_arrangement_colors WHERE id = ?", [result.insertId]);
  res.status(201).json(rows[0]);
}));

app.delete("/api/custom-arrangement-colors/:id", asyncHandler(async (req, res) => {
  await pool.query("DELETE FROM custom_arrangement_colors WHERE id = ?", [req.params.id]);
  res.json({ success: true });
}));

// ---------- CUSTOM ARRANGEMENT IMAGES TABLE API ----------
app.get("/api/custom-arrangement-images/:customArrangementId", asyncHandler(async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM custom_arrangement_images WHERE custom_arrangement_id = ? ORDER BY sort_order ASC", [req.params.customArrangementId]);
  res.json(rows);
}));

app.post("/api/custom-arrangement-images", asyncHandler(async (req, res) => {
  const { customArrangementId, imageData, sortOrder } = req.body;
  const [result] = await pool.query(
    "INSERT INTO custom_arrangement_images (custom_arrangement_id, image_data, sort_order) VALUES (?, ?, ?)",
    [customArrangementId, imageData, sortOrder || 0]
  );
  const [rows] = await pool.query("SELECT * FROM custom_arrangement_images WHERE id = ?", [result.insertId]);
  res.status(201).json(rows[0]);
}));

app.delete("/api/custom-arrangement-images/:id", asyncHandler(async (req, res) => {
  await pool.query("DELETE FROM custom_arrangement_images WHERE id = ?", [req.params.id]);
  res.json({ success: true });
}));

// ---------- REVIEWS TABLE API ----------
app.get("/api/reviews", asyncHandler(async (_req, res) => {
  const [rows] = await pool.query("SELECT * FROM vw_review_summary ORDER BY review_date DESC");
  res.json(rows);
}));

app.get("/api/reviews/order/:orderId", asyncHandler(async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM reviews WHERE order_id = ?", [req.params.orderId]);
  res.json(rows[0] || null);
}));

app.post("/api/orders/:id/review", asyncHandler(async (req, res) => {
  const [orders] = await pool.query("SELECT customer_id, status FROM orders WHERE id = ?", [req.params.id]);
  if (!orders.length) return res.status(404).json({ error: "Order not found" });
  if (orders[0].status !== "completed") return res.status(400).json({ error: "Only completed orders can be reviewed" });

  await pool.query(
    `INSERT INTO reviews (order_id, customer_id, rating, comment)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = VALUES(comment), created_at = NOW()`,
    [req.params.id, orders[0].customer_id, Number(req.body.rating), req.body.comment || ""]
  );

  const [rows] = await pool.query("SELECT * FROM orders WHERE id = ?", [req.params.id]);
  res.json(await mapOrder(rows[0]));
}));

app.put("/api/reviews/:id", asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  await pool.query("UPDATE reviews SET rating = ?, comment = ? WHERE id = ?", [rating, comment, req.params.id]);
  const [rows] = await pool.query("SELECT * FROM reviews WHERE id = ?", [req.params.id]);
  res.json(rows[0]);
}));

app.delete("/api/reviews/:id", asyncHandler(async (req, res) => {
  await pool.query("DELETE FROM reviews WHERE id = ?", [req.params.id]);
  res.json({ success: true });
}));

// ---------- CART_ITEMS TABLE API ----------
app.get("/api/cart-items/:customerId", asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT ci.*, p.name, p.price, p.category, p.description, p.image, p.in_stock
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     WHERE ci.customer_id = ?
     ORDER BY ci.updated_at DESC`,
    [req.params.customerId]
  );
  res.json(rows);
}));

app.post("/api/cart-items", asyncHandler(async (req, res) => {
  const { customerId, productId, quantity } = req.body;
  await pool.query(
    `INSERT INTO cart_items (customer_id, product_id, quantity)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity), updated_at = NOW()`,
    [customerId, productId, quantity || 1]
  );
  res.status(201).json({ success: true });
}));

app.put("/api/cart-items/:id", asyncHandler(async (req, res) => {
  await pool.query("UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE id = ?", [req.body.quantity, req.params.id]);
  res.json({ success: true });
}));

app.delete("/api/cart-items/:id", asyncHandler(async (req, res) => {
  await pool.query("DELETE FROM cart_items WHERE id = ?", [req.params.id]);
  res.json({ success: true });
}));

app.delete("/api/cart-items/customer/:customerId", asyncHandler(async (req, res) => {
  await pool.query("DELETE FROM cart_items WHERE customer_id = ?", [req.params.customerId]);
  res.json({ success: true });
}));

// ---------- REPORT / VIEW API ----------
app.get("/api/dashboard-stats", asyncHandler(async (_req, res) => {
  const [rows] = await pool.query("SELECT * FROM vw_dashboard_stats");
  res.json(rows[0] || {});
}));

app.get("/api/order-summary", asyncHandler(async (_req, res) => {
  const [rows] = await pool.query("SELECT * FROM vw_order_summary");
  res.json(rows);
}));

app.get("/api/product-sales", asyncHandler(async (_req, res) => {
  const [rows] = await pool.query("SELECT * FROM vw_product_sales");
  res.json(rows);
}));

app.get("/api/review-summary", asyncHandler(async (_req, res) => {
  const [rows] = await pool.query("SELECT * FROM vw_review_summary");
  res.json(rows);
}));

// ---------- Static React Build ----------
app.use(express.static(path.join(__dirname, "dist")));

// React fallback. Keep API 404s as JSON, but send React for normal routes.
app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "API route not found" });
  }
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// ---------- Error Handler ----------
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Server error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));