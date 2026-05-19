import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '15mb' }));

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

const mapProduct = (row) => ({
  id: String(row.id),
  name: row.name,
  price: Number(row.price),
  category: row.category,
  description: row.description || '',
  image: row.image || '/images/bouquet1.jpg',
  inStock: Boolean(row.in_stock),
  createdAt: row.created_at,
});

const mapUser = (row) => ({
  id: String(row.id),
  fullName: row.full_name,
  email: row.email,
  username: row.username,
  contactNumber: row.contact_number,
  address: row.address || '',
  password: row.password,
  role: row.role,
  createdAt: row.created_at,
});

const generateOrderNumber = () => {
  const now = new Date();
  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `MFS-${year}${month}${day}-${rand}`;
};

const mapOrder = async (row) => {
  const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC', [row.id]);
  const [reviews] = await pool.query('SELECT * FROM reviews WHERE order_id = ?', [row.id]);
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
        category: 'bouquet',
        description: '',
        image: item.product_image || '/images/bouquet1.jpg',
        inStock: true,
        createdAt: item.created_at,
      },
      quantity: Number(item.quantity),
    })),
    totalAmount: Number(row.total_amount),
    pickupDate: row.pickup_date,
    pickupTime: row.pickup_time,
    messageCard: row.message_card || '',
    paymentMethod: row.payment_method,
    gcashRefNumber: row.gcash_ref_number || undefined,
    gcashReceiptImage: row.gcash_receipt_image || undefined,
    paymentStatus: row.payment_status || 'pending',
    isCustomOrder: Boolean(row.is_custom_order),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    review: reviews[0]
      ? { rating: Number(reviews[0].rating), comment: reviews[0].comment || '', createdAt: reviews[0].created_at }
      : undefined,
  };

  if (row.is_custom_order) {
    const [customRows] = await pool.query('SELECT * FROM custom_arrangements WHERE order_id = ?', [row.id]);
    if (customRows.length) {
      const custom = customRows[0];
      const [flowers] = await pool.query('SELECT flower_type FROM custom_arrangement_flowers WHERE custom_arrangement_id = ?', [custom.id]);
      const [colors] = await pool.query('SELECT color FROM custom_arrangement_colors WHERE custom_arrangement_id = ?', [custom.id]);
      const [images] = await pool.query('SELECT image_data FROM custom_arrangement_images WHERE custom_arrangement_id = ? ORDER BY sort_order ASC', [custom.id]);
      order.customArrangement = {
        description: custom.description || '',
        flowerTypes: flowers.map((f) => f.flower_type),
        colors: colors.map((c) => c.color),
        style: custom.style,
        occasion: custom.occasion,
        budgetMin: Number(custom.budget_min),
        budgetMax: Number(custom.budget_max),
        referenceImages: images.map((i) => i.image_data),
        additionalNotes: custom.additional_notes || '',
      };
    }
  }

  return order;
};

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, database: 'connected' });
  } catch (error) {
    res.status(500).json({ ok: false, database: 'error', message: error.message });
  }
});

app.get('/api/products', async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM products ORDER BY id ASC');
  res.json(rows.map(mapProduct));
});

app.post('/api/auth/login', async (req, res) => {
  const { identifier, password } = req.body;
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE (email = ? OR username = ?) AND password = ? LIMIT 1',
    [identifier, identifier, password]
  );
  if (!rows.length) return res.status(401).json({ message: 'Invalid email/username or password.' });
  res.json(mapUser(rows[0]));
});

app.post('/api/auth/register', async (req, res) => {
  const { fullName, email, username, contactNumber, address, password } = req.body;
  const [existing] = await pool.query('SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1', [email, username]);
  if (existing.length) return res.status(409).json({ message: 'Email or username already exists.' });

  const [result] = await pool.query(
    `INSERT INTO users (full_name, email, username, contact_number, address, password, role)
     VALUES (?, ?, ?, ?, ?, ?, 'customer')`,
    [fullName, email, username, contactNumber, address, password]
  );
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
  res.status(201).json(mapUser(rows[0]));
});

app.get('/api/customers', async (_req, res) => {
  const [rows] = await pool.query("SELECT * FROM users WHERE role = 'customer' ORDER BY created_at DESC");
  res.json(rows.map(mapUser));
});

app.get('/api/users', async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
  res.json(rows.map(mapUser));
});

app.put('/api/users/:id', async (req, res) => {
  const { fullName, email, username, contactNumber, address, password, role } = req.body;
  await pool.query(
    'UPDATE users SET full_name = ?, email = ?, username = ?, contact_number = ?, address = ?, password = ?, role = ? WHERE id = ?',
    [fullName, email, username, contactNumber, address, password, role, req.params.id]
  );
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ message: 'User not found' });
  res.json(mapUser(rows[0]));
});

app.post('/api/products', async (req, res) => {
  const { name, price, category, description, image, inStock } = req.body;
  const [result] = await pool.query(
    `INSERT INTO products (name, price, category, description, image, in_stock)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, Number(price), category, description, image, inStock ? 1 : 0]
  );

  const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
  res.status(201).json(mapProduct(rows[0]));
});

app.put('/api/products/:id', async (req, res) => {
  const { name, price, category, description, image, inStock } = req.body;
  await pool.query(
    `UPDATE products
     SET name = ?, price = ?, category = ?, description = ?, image = ?, in_stock = ?
     WHERE id = ?`,
    [name, Number(price), category, description, image, inStock ? 1 : 0, req.params.id]
  );

  const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ message: 'Product not found' });
  res.json(mapProduct(rows[0]));
});

app.delete('/api/products/:id', async (req, res) => {
  await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
  res.status(204).send();
});

app.get('/api/orders', async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
  res.json(await Promise.all(rows.map(mapOrder)));
});

app.get('/api/orders/customer/:customerId', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC', [req.params.customerId]);
  res.json(await Promise.all(rows.map(mapOrder)));
});

app.post('/api/orders', async (req, res) => {
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
      data.messageCard || '',
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
      [orderId, ca.description, ca.style, ca.occasion, Number(ca.budgetMin), Number(ca.budgetMax), ca.additionalNotes || '']
    );
    const customId = customResult.insertId;
    for (const flower of ca.flowerTypes || []) {
      await pool.query('INSERT INTO custom_arrangement_flowers (custom_arrangement_id, flower_type) VALUES (?, ?)', [customId, flower]);
    }
    for (const color of ca.colors || []) {
      await pool.query('INSERT INTO custom_arrangement_colors (custom_arrangement_id, color) VALUES (?, ?)', [customId, color]);
    }
    for (const [index, image] of (ca.referenceImages || []).entries()) {
      await pool.query('INSERT INTO custom_arrangement_images (custom_arrangement_id, image_data, sort_order) VALUES (?, ?, ?)', [customId, image, index]);
    }
  }

  const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
  res.status(201).json(await mapOrder(rows[0]));
});

app.put('/api/orders/:id/status', async (req, res) => {
  await pool.query('UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?', [req.body.status, req.params.id]);
  const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ message: 'Order not found' });
  res.json(await mapOrder(rows[0]));
});

app.put('/api/orders/:id/payment-status', async (req, res) => {
  await pool.query('UPDATE orders SET payment_status = ?, updated_at = NOW() WHERE id = ?', [req.body.paymentStatus, req.params.id]);
  const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ message: 'Order not found' });
  res.json(await mapOrder(rows[0]));
});

app.post('/api/orders/:id/review', async (req, res) => {
  const [orders] = await pool.query('SELECT customer_id, status FROM orders WHERE id = ?', [req.params.id]);
  if (!orders.length) return res.status(404).json({ message: 'Order not found' });
  if (orders[0].status !== 'completed') return res.status(400).json({ message: 'Only completed orders can be reviewed' });

  await pool.query(
    `INSERT INTO reviews (order_id, customer_id, rating, comment)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = VALUES(comment), created_at = NOW()`,
    [req.params.id, orders[0].customer_id, Number(req.body.rating), req.body.comment || '']
  );
  const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
  res.json(await mapOrder(rows[0]));
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: error.message || 'Server error' });
});

app.listen(port, () => {
  console.log(`Macel's Flower Shop API running on port ${port}`);
});