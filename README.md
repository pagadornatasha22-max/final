# 🌸 Macel's Flower Shop — Web-Based Flower Ordering System

> **Canipaan, Hinunangan, Southern Leyte**
> 📍 GPS: `10.414779, 125.185361`

A full-featured web-based flower ordering system built with **React**, **TypeScript**, **Vite**, and **Tailwind CSS**. Customers can browse, customize, and order flowers online with GCash payment, while the admin manages products, orders, and reviews from a dedicated dashboard.

---

## 📋 Table of Contents

- [Features](#-features)
- [Demo Credentials](#-demo-credentials)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started (Local)](#-getting-started-local)
- [Deployment Guide](#-deployment-guide)
  - [Step 1 — Upload to GitHub](#step-1--upload-to-github)
  - [Step 2 — Create MySQL Database on Aiven](#step-2--create-mysql-database-on-aiven)
  - [Step 3 — Connect Aiven to MySQL Workbench](#step-3--connect-aiven-to-mysql-workbench)
  - [Step 4 — Create Tables in Workbench](#step-4--create-tables-in-workbench)
  - [Step 5 — Deploy to Render](#step-5--deploy-to-render)
  - [Database-Connected Menu and Admin Products](#database-connected-menu-and-admin-products)
- [Database Schema](#-database-schema)
- [System Modules](#-system-modules)
- [User Flow](#-user-flow)
- [Screenshots Overview](#-screenshots-overview)
- [License](#-license)

---

## ✨ Features

### 🔐 Authentication
- Login with email or username + password
- Customer registration with full profile (name, email, username, contact, address)
- Role-based access control (Admin / Customer)
- Persistent sessions — stays logged in across page refreshes

### 🛒 Customer Side
- **Browse Products** — View flower bouquets, dozen arrangements, and custom products
- **Search & Filter** — Search by name/description, filter by category
- **Shopping Cart** — Add, update quantity, remove items
- **Direct Order** — Buy a single product instantly without cart
- **Custom Arrangements** — 4-step wizard to design a custom flower arrangement:
  - Choose flower types (12 options), colors (10 options), arrangement style (8 options)
  - Select occasion, budget range, describe your vision
  - Upload up to 5 reference/sample photos
  - Complete checkout with GCash payment
- **GCash Payment** — Enter 13-digit reference number + upload receipt screenshot with validation
- **Order Tracking** — Visual progress bar: Pending → Preparing → Ready for Pickup → Completed
- **Reviews** — Rate completed orders with 1-5 stars and optional comment
- **Profile Management** — View and edit personal information
- **Google Maps** — Embedded map showing shop location on login page

### 👨‍💼 Admin Side
- **Dashboard** — Overview of total orders, sales, customers, products, custom orders, and recent reviews
- **Manage Products** — Add, edit, update prices, toggle stock, delete products with image selection
- **Manage Orders** — View all orders, filter by status, search by order number/customer/GCash ref, update order status, view full order details including custom arrangements and reference photos
- **Manage Reviews** — Dedicated page with average rating, rating breakdown chart, filter by stars, search reviews, view full order details per review
- **Manage Users** — View and modify admin/customer accounts, contact info, password, address, and role
- **GCash Verification** — View uploaded receipt screenshots and reference numbers per order, then approve or reject e-wallet payment manually

---

## 🔑 Demo Credentials

| Role     | Username | Password   |
|----------|----------|------------|
| Admin    | `admin`  | `admin123` |
| Customer | *(register a new account)* | |

---

## 🛠 Tech Stack

| Technology     | Purpose                     |
|----------------|-----------------------------|
| React 19       | UI framework                |
| TypeScript     | Type safety                 |
| Vite 7         | Build tool & dev server     |
| Tailwind CSS 4 | Utility-first styling       |
| Lucide React   | Icon library                |
| LocalStorage   | Client-side data persistence|
| Google Maps    | Embedded location map       |
| **GitHub**     | **Version control & repository hosting** |
| **Aiven**      | **Cloud MySQL database hosting** |
| **MySQL Workbench** | **Database management GUI** |
| **Render**     | **Web app deployment & hosting** |

---

## 📁 Project Structure

```
macels-flower-shop/
├── public/
│   └── images/                    # Product images (AI-generated)
│       ├── bouquet1.jpg
│       ├── bouquet2.jpg
│       ├── bouquet3.jpg
│       ├── dozen1.jpg
│       ├── dozen2.jpg
│       ├── custom1.jpg
│       ├── custom2.jpg
│       └── hero-bg.jpg
│
├── database/
│   └── macels_flower_shop.sql     # Full MySQL database schema
│
├── src/
│   ├── components/
│   │   └── Navbar.tsx             # Navigation bar (admin & customer)
│   │
│   ├── context/                   # React Context providers
│   │   ├── AuthContext.tsx        # Authentication & user management
│   │   ├── CartContext.tsx        # Shopping cart state
│   │   ├── ProductContext.tsx     # Product catalog management
│   │   └── OrderContext.tsx       # Orders & reviews management
│   │
│   ├── data/
│   │   └── initialData.ts        # Seed data (admin user + 9 products)
│   │
│   ├── pages/
│   │   ├── LoginPage.tsx          # Login with Google Maps location
│   │   ├── RegisterPage.tsx       # Customer registration
│   │   ├── CustomerDashboard.tsx  # Shop page with products & reviews
│   │   ├── CartPage.tsx           # Shopping cart
│   │   ├── CheckoutPage.tsx       # Checkout with GCash payment
│   │   ├── CustomizePage.tsx      # 4-step custom arrangement wizard
│   │   ├── MyOrdersPage.tsx       # Order history & review submission
│   │   ├── ProfilePage.tsx        # Profile management
│   │   └── admin/
│   │       ├── AdminDashboard.tsx # Admin overview & stats
│   │       ├── ManageProducts.tsx # CRUD for products
│   │       ├── ManageOrders.tsx   # Order management & status updates
│   │       └── ManageReviews.tsx  # Review analytics & management
│   │
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces
│   │
│   ├── utils/
│   │   └── cn.ts                 # Tailwind class merge utility
│   │
│   ├── App.tsx                   # Main app with routing & providers
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Global styles & Tailwind config
│
├── index.html                    # HTML entry (Google Fonts)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🚀 Getting Started (Local)

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/macels-flower-shop.git
cd macels-flower-shop

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app runs at `http://localhost:5173` by default.

---

## 🌍 Deployment Guide

This section walks you through deploying the full system to production using **GitHub**, **Aiven** (cloud MySQL), **MySQL Workbench**, and **Render** (web hosting).

### Architecture Overview

```
┌─────────────┐       ┌───────────────┐       ┌──────────────────┐
│   GitHub     │──────▶│    Render      │       │  Aiven (Cloud)   │
│ (Source Code)│       │ (Web Hosting)  │◀─────▶│ (MySQL Database) │
└─────────────┘       └───────────────┘       └──────────────────┘
                                                       ▲
                                                       │
                                               ┌───────┴────────┐
                                               │ MySQL Workbench │
                                               │ (DB Management) │
                                               └────────────────┘
```

---

### Step 1 — Upload to GitHub

#### 1.1 Create a GitHub Account (if you don't have one)

1. Go to [https://github.com](https://github.com)
2. Click **Sign up** and follow the registration steps
3. Verify your email address

#### 1.2 Install Git

- **Windows:** Download from [https://git-scm.com/download/win](https://git-scm.com/download/win) and install
- **Mac:** Run `brew install git` or download from [https://git-scm.com/download/mac](https://git-scm.com/download/mac)
- **Linux:** Run `sudo apt install git`

Verify installation:
```bash
git --version
```

#### 1.3 Create a New Repository on GitHub

1. Log in to GitHub
2. Click the **`+`** icon (top-right) → **New repository**
3. Fill in:
   - **Repository name:** `macels-flower-shop`
   - **Description:** `Web-Based Flower Ordering System for Macel's Flower Shop`
   - **Visibility:** `Public` (or Private)
   - ❌ Do NOT check "Add a README file" (we already have one)
4. Click **Create repository**
5. You'll see a page with setup instructions — keep this page open

#### 1.4 Push Your Code to GitHub

Open a terminal in your project folder and run:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - Macel's Flower Shop Ordering System"

# Set the main branch
git branch -M main

# Add your GitHub repository as remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/macels-flower-shop.git

# Push to GitHub
git push -u origin main
```

#### 1.5 Verify on GitHub

1. Go to `https://github.com/YOUR_USERNAME/macels-flower-shop`
2. You should see all your files, folders, and the README displayed
3. Verify the `database/macels_flower_shop.sql` file is uploaded

> **✅ Done!** Your code is now on GitHub.

---

### Step 2 — Create MySQL Database on Aiven

Aiven provides a free-tier cloud MySQL database that's accessible from anywhere.

#### 2.1 Create an Aiven Account

1. Go to [https://aiven.io](https://aiven.io)
2. Click **Get Started Free** or **Sign Up**
3. You can sign up with **Google**, **GitHub**, or **Email**
4. Verify your email if required

#### 2.2 Create a MySQL Service

1. After logging in, you'll be on the **Aiven Console** dashboard
2. Click **Create service** (or **+ Create a service**)
3. Select **MySQL** from the list of services
4. Configure:
   - **Cloud Provider:** Google Cloud, AWS, or Azure (any works)
   - **Region:** Choose the closest to the Philippines (e.g., `google-asia-southeast1` for Singapore)
   - **Plan:** Select **Free** (Hobbyist) or the lowest-cost plan
   - **Service Name:** `macels-flower-shop-db` (or any name)
5. Click **Create service**
6. Wait 1-3 minutes for the service to be **Running** (green status)

#### 2.3 Get Your Connection Details

Once the service is running:

1. Click on your MySQL service name to open its details
2. Go to the **Overview** tab
3. You'll see the **Connection information** section. Note down these details:

| Field | Example Value |
|-------|--------------|
| **Host** | `macels-flower-shop-db-yourname-xxxx.a.aivencloud.com` |
| **Port** | `12345` |
| **User** | `avnadmin` |
| **Password** | `AVNS_xxxxxxxxxxxxxxxxxx` |
| **Database** | `defaultdb` |
| **SSL Mode** | `REQUIRED` |

4. Click **Copy** next to each value, or use the **Quick connect** dropdown and select **MySQL Workbench** for ready-to-use connection parameters

#### 2.4 Download the CA Certificate

1. In the **Overview** tab, scroll to **CA Certificate**
2. Click **Download CA certificate** — this downloads a file called `ca.pem`
3. Save this file somewhere safe (e.g., `C:\Users\YourName\aiven-certs\ca.pem` on Windows or `~/aiven-certs/ca.pem` on Mac/Linux)

> **⚠️ Important:** The CA certificate is needed for secure SSL connections from MySQL Workbench.

> **✅ Done!** Your cloud MySQL database is ready on Aiven.

---

### Step 3 — Connect Aiven to MySQL Workbench

#### 3.1 Install MySQL Workbench

1. Download from [https://dev.mysql.com/downloads/workbench/](https://dev.mysql.com/downloads/workbench/)
2. Install and open **MySQL Workbench**

#### 3.2 Create a New Connection to Aiven

1. On the Workbench home screen, click the **`+`** icon next to **MySQL Connections**
2. Fill in the connection details using your Aiven values:

| Field | Value |
|-------|-------|
| **Connection Name** | `Aiven - Macels Flower Shop` |
| **Connection Method** | `Standard TCP/IP over SSH` → change to **`Standard (TCP/IP)`** |
| **Hostname** | *(paste your Aiven Host)* e.g., `macels-flower-shop-db-yourname-xxxx.a.aivencloud.com` |
| **Port** | *(paste your Aiven Port)* e.g., `12345` |
| **Username** | `avnadmin` |
| **Default Schema** | `defaultdb` |

3. Click **Store in Vault...** next to Password → enter your Aiven password → click **OK**

#### 3.3 Configure SSL (Required for Aiven)

1. In the same connection setup window, click the **SSL** tab
2. Set:
   - **Use SSL:** `Require`
   - **SSL CA File:** Click **Browse** and select the `ca.pem` file you downloaded from Aiven
3. Leave SSL Cert File and SSL Key File **empty**

#### 3.4 Test and Connect

1. Click **Test Connection**
2. You should see: **✅ "Successfully made the MySQL connection"**
3. Click **OK** to save the connection
4. **Double-click** the connection on the home screen to open it

> **If the test fails:**
> - Verify the hostname, port, username, and password match Aiven exactly
> - Make sure the CA certificate path is correct
> - Check that your internet/firewall allows outbound connections on the Aiven port
> - On Aiven console, check **Allowed IP Addresses** under the service's Advanced Configuration — add your IP or use `0.0.0.0/0` to allow all

> **✅ Done!** MySQL Workbench is connected to your Aiven cloud database.

---

### Step 4 — Create Tables in Workbench

Now that Workbench is connected to Aiven, let's create all the database tables.

#### 4.1 Open the SQL File

1. In the connected Workbench window, go to:
   - **File** → **Open SQL Script...**
2. Navigate to your project folder and select:
   ```
   database/macels_flower_shop.sql
   ```
3. The SQL file opens in a new **Query Tab**

#### 4.2 Modify for Aiven (Important!)

Since Aiven already created a database called `defaultdb`, you have two options:

**Option A — Use the default database (recommended for Aiven free tier):**

In the SQL editor, find and **comment out or delete** these two lines at the top:
```sql
-- CREATE DATABASE IF NOT EXISTS macels_flower_shop;
-- USE macels_flower_shop;
```

Then add this line at the very top instead:
```sql
USE defaultdb;
```

**Option B — Create a new database:**

Keep the SQL as-is. The script will create `macels_flower_shop` database. After execution, switch to it in the Navigator.

#### 4.3 Execute the Script

1. Click the **⚡ Execute** button (lightning bolt icon) in the toolbar — or press **`Ctrl + Shift + Enter`**
2. Wait for execution to complete
3. Check the **Output** panel at the bottom — you should see green checkmarks (✓) for each statement

> **⚠️ Note:** If you see errors about `DELIMITER` or stored procedures on Aiven, this is normal for some cloud MySQL versions. The tables and seed data will still be created correctly.

#### 4.4 Verify Tables Were Created

1. In the **Navigator** panel (left side), click the **Schemas** tab
2. Click the **🔄 refresh** button (circular arrows)
3. Expand `defaultdb` (or `macels_flower_shop`) → expand **Tables**
4. You should see all **10 tables:**

```
📂 defaultdb (or macels_flower_shop)
  📂 Tables
    ├── cart_items
    ├── custom_arrangement_colors
    ├── custom_arrangement_flowers
    ├── custom_arrangement_images
    ├── custom_arrangements
    ├── order_items
    ├── orders
    ├── products
    ├── reviews
    └── users
  📂 Views
    ├── vw_dashboard_stats
    ├── vw_order_summary
    ├── vw_product_sales
    └── vw_review_summary
  📂 Stored Procedures
    ├── sp_add_order_item
    ├── sp_generate_order_number
    ├── sp_place_custom_order
    ├── sp_place_order
    ├── sp_submit_review
    └── sp_update_order_status
```

#### 4.5 Verify Seed Data

Open a new Query Tab (**File** → **New Query Tab** or `Ctrl + T`) and run:

```sql
-- Check admin user
SELECT id, full_name, username, email, role FROM users;
```

Expected output:

| id | full_name    | username | email                          | role  |
|----|-------------|----------|--------------------------------|-------|
| 1  | Macel Admin | admin    | admin@macelsflowershop.com     | admin |

```sql
-- Check products (should be 9 rows)
SELECT id, name, price, category, in_stock FROM products;
```

Expected output:

| id | name                          | price   | category | in_stock |
|----|-------------------------------|---------|----------|----------|
| 1  | Pink Rose Elegance Bouquet    | 850.00  | bouquet  | 1        |
| 2  | Classic Red Romance Bouquet   | 1200.00 | bouquet  | 1        |
| 3  | Sunshine Sunflower Bouquet    | 750.00  | bouquet  | 1        |
| 4  | One Dozen Red Roses           | 1500.00 | dozen    | 1        |
| 5  | One Dozen Pink Tulips         | 1350.00 | dozen    | 1        |
| 6  | One Dozen Mixed Roses         | 1400.00 | dozen    | 1        |
| 7  | Luxury Flower Box             | 2500.00 | custom   | 1        |
| 8  | Heart-Shaped Rose Arrangement | 2800.00 | custom   | 1        |
| 9  | Custom Wedding Bouquet        | 3000.00 | custom   | 1        |

```sql
-- Test dashboard stats view
SELECT * FROM vw_dashboard_stats;
```

#### 4.6 Explore Tables (Optional)

Right-click any table → **Select Rows – Limit 1000** to view data, or:

```sql
DESCRIBE users;
DESCRIBE products;
DESCRIBE orders;
DESCRIBE order_items;
DESCRIBE custom_arrangements;
DESCRIBE reviews;
DESCRIBE cart_items;
```

> **✅ Done!** All tables, views, stored procedures, and seed data are live on Aiven cloud MySQL.

---

### Step 5 — Deploy to Render

Render hosts both the **backend API** and the **frontend website**. The backend API connects to Aiven MySQL, and the frontend reads live database records from that API.

#### 5.1 Create a Render Account

1. Go to [https://render.com](https://render.com)
2. Click **Get Started for Free**
3. Sign up with your **GitHub** account (recommended — this links your repos automatically)

#### 5.2 Create a Backend Web Service (Aiven API)

This backend makes the admin product page real: when admin adds/edits/deletes a product, it writes to the Aiven `products` table. The customer menu then reads those same database records.

1. On the Render dashboard, click **New** → **Web Service**
2. Connect your GitHub account if not already connected
3. Select your repository: **`macels-flower-shop`**
4. Configure:

| Field | Value |
|-------|-------|
| **Name** | `macels-flower-shop-api` |
| **Branch** | `main` |
| **Root Directory** | *(leave blank)* |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |

5. Click **Environment** and add your Aiven values:

| Key | Value |
|-----|-------|
| `PORT` | `4000` |
| `CORS_ORIGIN` | `https://macels-flower-shop.onrender.com` |
| `MYSQL_HOST` | your Aiven host |
| `MYSQL_PORT` | your Aiven port |
| `MYSQL_USER` | `avnadmin` |
| `MYSQL_PASSWORD` | your Aiven password |
| `MYSQL_DATABASE` | `defaultdb` or `macels_flower_shop` |
| `DB_SSL` | `true` |

6. Click **Create Web Service**
7. Wait for Render to deploy. Your backend URL will look like:

```text
https://macels-flower-shop-api.onrender.com
```

8. Test the API health endpoint in your browser:

```text
https://macels-flower-shop-api.onrender.com/api/health
```

Expected response:

```json
{ "ok": true, "database": "connected" }
```

9. Test the products endpoint:

```text
https://macels-flower-shop-api.onrender.com/api/products
```

You should see the 9 product records from your Aiven `products` table.

#### 5.3 Create a New Static Site

Since this is a React/Vite frontend:

1. On the Render dashboard, click **New** → **Static Site**
2. Connect your GitHub account if not already connected
3. Find and select the repository: **`macels-flower-shop`**
4. Configure the build settings:

| Field | Value |
|-------|-------|
| **Name** | `macels-flower-shop` |
| **Branch** | `main` |
| **Root Directory** | *(leave blank)* |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

Add this environment variable so the frontend connects to the Render backend API:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://macels-flower-shop-api.onrender.com` |

5. Click **Create Static Site**

#### 5.4 Wait for Deployment

1. Render will clone your repo, install dependencies, and build the project
2. Watch the **Build Logs** — you should see:
   ```
   npm install...
   npm run build...
   ✓ built in X.XXs
   ==> Build successful 🎉
   ==> Deploying...
   ==> Your site is live 🎉
   ```
3. Deployment takes about 1-3 minutes

#### 5.5 Access Your Live Site

1. Once deployed, Render gives you a URL like:
   ```
   https://macels-flower-shop.onrender.com
   ```
2. Click the URL to open your live flower shop! 🌸
3. Test by logging in with admin credentials: `admin` / `admin123`

#### 5.6 Set Up Environment Variables (for Aiven connection)

If you use the included backend (`server.js`), add these environment variables to your **Render Web Service** (backend), not the static frontend:

1. Go to your Render service → **Environment**
2. Click **Add Environment Variable** and add:

| Key | Value |
|-----|-------|
| `MYSQL_HOST` | `macels-flower-shop-db-yourname-xxxx.a.aivencloud.com` |
| `MYSQL_PORT` | `12345` |
| `MYSQL_USER` | `avnadmin` |
| `MYSQL_PASSWORD` | `AVNS_xxxxxxxxxxxxxxxxxx` |
| `MYSQL_DATABASE` | `defaultdb` |
| `DB_SSL` | `true` |

3. Click **Save Changes** — Render will redeploy automatically

#### 5.7 Custom Domain (Optional)

1. Go to your Render service → **Settings** → **Custom Domains**
2. Click **Add Custom Domain**
3. Enter your domain (e.g., `macelsflowershop.com`)
4. Follow the DNS instructions to point your domain to Render
5. Render automatically provisions a free SSL certificate

#### 5.8 Auto-Deploy from GitHub

Every time you push new code to GitHub, Render automatically rebuilds and redeploys:

```bash
# Make changes to your code, then:
git add .
git commit -m "Update: added new flower products"
git push origin main

# Render auto-deploys within 1-2 minutes 🚀
```

> **✅ Done!** Your Macel's Flower Shop is live on the internet!

---

### Database-Connected Records and Admin Products

The project now includes a backend API in `server.js`. This makes the system more realistic because records can come from Aiven MySQL instead of only localStorage.

#### Product/Menu Records

1. **Admin opens Manage Products**
2. The frontend calls:
   ```text
   GET /api/products
   ```
3. The backend reads from Aiven MySQL:
   ```sql
   SELECT * FROM products ORDER BY id ASC;
   ```
4. The exact records in the `products` table appear in:
   - Customer Dashboard product menu
   - Admin Manage Products table
   - Product search and category filters

When the admin adds or edits products:

| Admin Action | API Endpoint | Database Action |
|-------------|--------------|-----------------|
| Add product | `POST /api/products` | `INSERT INTO products (...) VALUES (...);` |
| Edit product | `PUT /api/products/:id` | `UPDATE products SET ... WHERE id = ?;` |
| Delete product | `DELETE /api/products/:id` | `DELETE FROM products WHERE id = ?;` |
| Refresh table | `GET /api/products` | Reads latest Aiven records |

#### Other Database API Endpoints Included

| Feature | API Endpoint | Database Tables Used |
|---------|--------------|----------------------|
| Login | `POST /api/auth/login` | `users` |
| Register | `POST /api/auth/register` | `users` |
| All user accounts for admin | `GET /api/users` | `users` |
| Customer list for admin stats | `GET /api/customers` | `users` |
| Update profile | `PUT /api/users/:id` | `users` |
| All orders for admin | `GET /api/orders` | `orders`, `order_items`, `custom_arrangements`, `reviews` |
| Customer order history | `GET /api/orders/customer/:customerId` | `orders`, `order_items`, `custom_arrangements`, `reviews` |
| Create standard/custom order | `POST /api/orders` | `orders`, `order_items`, `custom_arrangements`, `custom_arrangement_flowers`, `custom_arrangement_colors`, `custom_arrangement_images` |
| Update order status | `PUT /api/orders/:id/status` | `orders` |
| Approve/reject GCash payment | `PUT /api/orders/:id/payment-status` | `orders.payment_status` |
| Submit review | `POST /api/orders/:id/review` | `reviews` |

#### Admin Product Image: Upload File or Paste Link

Admin can now change a product image in two ways:

| Method | What Happens | Saved In Database |
|--------|--------------|------------------|
| **Upload file** | Admin uploads JPG/PNG/WEBP. Browser converts it to a base64 data URL. | `products.image` as `LONGTEXT` |
| **Paste link** | Admin pastes an image URL starting with `http://` or `https://`. | `products.image` as URL text |
| **Choose existing image** | Admin selects one of the default images in `public/images`. | `products.image` as local path like `/images/bouquet1.jpg` |

The customer menu uses the same `products.image` value, so whatever image the admin saves is what customers see.

#### SQL Column for Product Images

The SQL file uses `LONGTEXT` for image fields so it can store either links or uploaded base64 images:

```sql
image LONGTEXT NULL COMMENT 'Image URL, local public path, or base64 uploaded image'
```

If you already created the database before this update, run this migration in MySQL Workbench:

```sql
USE macels_flower_shop;

ALTER TABLE products
MODIFY image LONGTEXT NULL COMMENT 'Image URL, local public path, or base64 uploaded image';

ALTER TABLE order_items
MODIFY product_image LONGTEXT NULL COMMENT 'Snapshot of product image at time of order';
```

For payment approval, make sure the `orders` table has `payment_status`:

```sql
ALTER TABLE orders
ADD COLUMN payment_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending'
COMMENT 'Admin e-wallet receipt verification'
AFTER gcash_receipt_image;

CREATE INDEX idx_orders_payment_status ON orders(payment_status);
```

If you are using Aiven's `defaultdb`, run:

```sql
USE defaultdb;

ALTER TABLE products
MODIFY image LONGTEXT NULL COMMENT 'Image URL, local public path, or base64 uploaded image';

ALTER TABLE order_items
MODIFY product_image LONGTEXT NULL COMMENT 'Snapshot of product image at time of order';

ALTER TABLE orders
ADD COLUMN payment_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending'
COMMENT 'Admin e-wallet receipt verification'
AFTER gcash_receipt_image;

CREATE INDEX idx_orders_payment_status ON orders(payment_status);
```

#### Local Testing With Aiven Records

Create a `.env` file using `.env.example`:

```bash
cp .env.example .env
```

Fill in your Aiven credentials:

```env
VITE_API_URL=http://localhost:4000
PORT=4000
CORS_ORIGIN=http://localhost:5173
MYSQL_HOST=your-aiven-host.a.aivencloud.com
MYSQL_PORT=12345
MYSQL_USER=avnadmin
MYSQL_PASSWORD=your-aiven-password
MYSQL_DATABASE=defaultdb
DB_SSL=true
```

Run the backend API in one terminal:

```bash
node server.js
```

Run the frontend in another terminal:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

Now the product menu and admin product table load from Aiven database records.

---

### 📍 Deployment Summary

| Service | Purpose | URL |
|---------|---------|-----|
| **GitHub** | Source code repository | `github.com/YOUR_USERNAME/macels-flower-shop` |
| **Aiven** | Cloud MySQL database | `macels-flower-shop-db-xxxx.a.aivencloud.com` |
| **MySQL Workbench** | Database management (local tool) | Desktop application |
| **Render** | Live website hosting | `macels-flower-shop.onrender.com` |

### Complete Deployment Flow

```
  Developer's Computer
         │
         │  git push
         ▼
  ┌─────────────┐     auto-deploy     ┌────────────────┐
  │   GitHub     │ ──────────────────▶ │     Render      │
  │  Repository  │                     │  (Live Website) │
  └─────────────┘                     │  macels-flower  │
                                      │  shop.onrender  │
                                      │     .com        │
                                      └────────┬───────┘
                                               │ connects to
                                               ▼
  ┌──────────────────┐              ┌──────────────────┐
  │  MySQL Workbench  │─────────────▶│   Aiven Cloud    │
  │  (Manage Tables)  │  SSL/TLS    │  MySQL Database  │
  └──────────────────┘              └──────────────────┘
```

---

### Troubleshooting Deployment

| Issue | Solution |
|-------|----------|
| **GitHub:** `Permission denied (publickey)` | Set up SSH keys: `ssh-keygen -t ed25519` then add to GitHub → Settings → SSH Keys. Or use HTTPS URL instead |
| **GitHub:** `Repository not found` | Check the remote URL: `git remote -v`. Fix with: `git remote set-url origin https://github.com/YOUR_USERNAME/macels-flower-shop.git` |
| **Aiven:** Service stuck on "Rebuilding" | Wait 3-5 minutes. Free tier services take longer to provision |
| **Aiven:** Can't connect from Workbench | Check IP whitelist in Aiven → service → Advanced → Allowed IP Addresses. Add `0.0.0.0/0` for testing |
| **Aiven:** SSL certificate error | Make sure you downloaded `ca.pem` from Aiven and set the path correctly in Workbench's SSL tab |
| **Workbench:** `Access denied for user` | Double-check username and password from Aiven. Re-copy the password — it's auto-generated |
| **Workbench:** `Can't connect to MySQL server` | Verify hostname and port. Make sure your firewall allows outbound TCP on the Aiven port |
| **Workbench:** `Error 1418` (stored procedures) | Run `SET GLOBAL log_bin_trust_function_creators = 1;` before executing the script. Or skip stored procedures on Aiven free tier |
| **Workbench:** Table already exists | Safe to ignore — uses `IF NOT EXISTS`. Or run `DROP DATABASE` first |
| **Render:** Build fails | Check build logs. Most common: wrong build command. Should be `npm install && npm run build` |
| **Render:** Blank page after deploy | Make sure Publish Directory is set to `dist` (not `build` or `public`) |
| **Render:** Site shows 404 on refresh | For Single Page Apps, add a `_redirects` file in `public/` with: `/* /index.html 200` |
| **Render:** Environment variables not loading | After adding env vars, click Save → Render will auto-redeploy. Wait 1-2 minutes |

---

## 🗄 Database Schema

The SQL schema is located at [`database/macels_flower_shop.sql`](database/macels_flower_shop.sql).

> **Full SQL Code:** The complete SQL code for **all tables, views, stored procedures, seed data, and sample queries** is in `database/macels_flower_shop.sql`. Copy and run the whole file in MySQL Workbench to create the complete database.

Important image storage note:

```sql
-- Products can store image URLs, local image paths, or uploaded base64 files.
products.image LONGTEXT

-- Order items snapshot the product image at the time of ordering.
order_items.product_image LONGTEXT
```

### Tables (10)

| # | Table | Description |
|---|-------|-------------|
| 1 | `users` | Admin and customer accounts |
| 2 | `products` | Flower products catalog |
| 3 | `orders` | All orders (standard + custom) |
| 4 | `order_items` | Products in each standard order |
| 5 | `custom_arrangements` | Custom arrangement details |
| 6 | `custom_arrangement_flowers` | Flower types for custom orders |
| 7 | `custom_arrangement_colors` | Colors for custom orders |
| 8 | `custom_arrangement_images` | Reference photos for custom orders |
| 9 | `reviews` | Customer star ratings & comments |
| 10 | `cart_items` | Persistent shopping cart |

### Entity Relationship

```
users (1) ──────── (N) orders
                        │
                        ├── (N) order_items ──── (1) products
                        │
                        ├── (1) custom_arrangements
                        │       ├── (N) custom_arrangement_flowers
                        │       ├── (N) custom_arrangement_colors
                        │       └── (N) custom_arrangement_images
                        │
                        └── (1) reviews

users (1) ──────── (N) cart_items ──── (1) products
```

### Views (4)

| View | Purpose |
|------|---------|
| `vw_order_summary` | Orders with review info and item count |
| `vw_product_sales` | Product sales stats (sold, revenue) |
| `vw_review_summary` | Reviews with customer and order details |
| `vw_dashboard_stats` | Single-row dashboard statistics |

### Stored Procedures (6)

| Procedure | Purpose |
|-----------|---------|
| `sp_generate_order_number` | Generates `MFS-YYMMDD-XXXX` format |
| `sp_place_order` | Creates a standard order |
| `sp_add_order_item` | Adds a product to an order |
| `sp_place_custom_order` | Creates a custom order with arrangement |
| `sp_update_order_status` | Updates order status |
| `sp_submit_review` | Submits/updates a review |

---

## 🖥 Admin Pages — What Data Shows from the Database

After running `macels_flower_shop.sql`, the database is seeded with **1 admin user** and **9 products**. All other tables (`orders`, `order_items`, `reviews`, `cart_items`, `custom_arrangements`, etc.) start **empty** — they fill up as customers place orders and leave reviews through the website.

Below is exactly what the admin sees on each page and the real data that comes from each database table.

---

### Admin Dashboard (`/admin-dashboard`)

| Dashboard Widget | Source Table | What It Shows After Initial Setup |
|-----------------|-------------|----------------------------------|
| Total Orders | `orders` | **0** (no orders yet) |
| Total Sales | `orders` | **₱0.00** (no completed orders) |
| Total Customers | `users` | **0** (no customer registered yet) |
| Total Products | `products` | **9** (from seed data) |
| Pending Count | `orders` | **0** |
| Preparing Count | `orders` | **0** |
| Ready Count | `orders` | **0** |
| Custom Orders Count | `orders` | **0** |
| Recent Orders List | `orders` | *Empty — "No orders yet"* |
| Customer Reviews | `reviews` | *Empty — "No reviews yet"* |
| Average Rating | `reviews` | **0.0** |
| User Accounts | `users` | **1 admin account** |

**Query — Dashboard stats after fresh setup:**
```sql
SELECT * FROM vw_dashboard_stats;
```

| total_orders | pending_orders | preparing_orders | ready_orders | completed_orders | custom_orders | total_sales | total_customers | total_products | in_stock_products | total_reviews | average_rating |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | 0 | 0 | 0 | 0 | 0 | 0.00 | 0 | 9 | 9 | 0 | 0.0 |

> **Note:** The only non-zero values are `total_products` and `in_stock_products` (both **9**) because the SQL script seeds 9 flower products. Everything else starts at zero and grows as customers use the system.

---

### Admin Manage Products (`/admin-products`)

This page shows all 9 products seeded by the SQL script. The data comes from the `products` table only.

**Query — Exact data the admin sees:**
```sql
SELECT id, name, price, category, image, in_stock FROM products ORDER BY id;
```

| id | name | price | category | image | in_stock |
|---|---|---|---|---|---|
| 1 | Pink Rose Elegance Bouquet | 850.00 | bouquet | /images/bouquet1.jpg | 1 |
| 2 | Classic Red Romance Bouquet | 1200.00 | bouquet | /images/bouquet2.jpg | 1 |
| 3 | Sunshine Sunflower Bouquet | 750.00 | bouquet | /images/bouquet3.jpg | 1 |
| 4 | One Dozen Red Roses | 1500.00 | dozen | /images/dozen1.jpg | 1 |
| 5 | One Dozen Pink Tulips | 1350.00 | dozen | /images/dozen2.jpg | 1 |
| 6 | One Dozen Mixed Roses | 1400.00 | dozen | /images/bouquet1.jpg | 1 |
| 7 | Luxury Flower Box | 2500.00 | custom | /images/custom1.jpg | 1 |
| 8 | Heart-Shaped Rose Arrangement | 2800.00 | custom | /images/custom2.jpg | 1 |
| 9 | Custom Wedding Bouquet | 3000.00 | custom | /images/bouquet2.jpg | 1 |

**Admin actions and their SQL:**

| Action | SQL |
|--------|-----|
| Add Product | `INSERT INTO products (name, price, category, description, image, in_stock) VALUES ('New Flower', 999.00, 'bouquet', 'Description', '/images/bouquet1.jpg', 1);` |
| Edit Product | `UPDATE products SET name='Updated Name', price=1100.00 WHERE id = 1;` |
| Toggle Stock | `UPDATE products SET in_stock = 0 WHERE id = 3;` |
| Delete Product | `DELETE FROM products WHERE id = 9;` |

**Product sales stats (all zeros initially — grows as orders complete):**
```sql
SELECT * FROM vw_product_sales;
```

| product_id | product_name | category | current_price | in_stock | total_sold | total_revenue | order_count |
|---|---|---|---|---|---|---|---|
| 1 | Pink Rose Elegance Bouquet | bouquet | 850.00 | 1 | 0 | 0.00 | 0 |
| 2 | Classic Red Romance Bouquet | bouquet | 1200.00 | 1 | 0 | 0.00 | 0 |
| 3 | Sunshine Sunflower Bouquet | bouquet | 750.00 | 1 | 0 | 0.00 | 0 |
| 4 | One Dozen Red Roses | dozen | 1500.00 | 1 | 0 | 0.00 | 0 |
| 5 | One Dozen Pink Tulips | dozen | 1350.00 | 1 | 0 | 0.00 | 0 |
| 6 | One Dozen Mixed Roses | dozen | 1400.00 | 1 | 0 | 0.00 | 0 |
| 7 | Luxury Flower Box | custom | 2500.00 | 1 | 0 | 0.00 | 0 |
| 8 | Heart-Shaped Rose Arrangement | custom | 2800.00 | 1 | 0 | 0.00 | 0 |
| 9 | Custom Wedding Bouquet | custom | 3000.00 | 1 | 0 | 0.00 | 0 |

---

### Admin Manage Orders (`/admin-orders`)

Initially shows **empty** — *"No orders found. Orders will appear here when customers place them."*

Orders appear when a customer completes checkout. Each order touches multiple tables:

| Table | What It Stores | When It Gets Data |
|-------|---------------|-------------------|
| `orders` | Order header (number, customer, total, status, GCash ref, pickup date) | Customer completes checkout |
| `order_items` | Products in the order (name, price, quantity snapshot) | Customer orders standard products |
| `custom_arrangements` | Custom design details (style, occasion, budget, description) | Customer submits a custom arrangement |
| `custom_arrangement_flowers` | Flower types chosen (roses, tulips, etc.) | Customer picks flowers in customize wizard |
| `custom_arrangement_colors` | Colors chosen (red, pink, white, etc.) | Customer picks colors in customize wizard |
| `custom_arrangement_images` | Uploaded reference/sample photos (base64) | Customer uploads reference photos |
| `reviews` | Star rating + comment | Customer reviews a completed order |

GCash/e-wallet payments now proceed as an order with `status = 'pending'` and `payment_status = 'pending'`. The customer is not blocked by automatic receipt matching. The admin opens the receipt image and manually approves or rejects payment.

| Payment Step | Database Field | Value |
|-------------|----------------|-------|
| Customer submits order | `orders.status` | `pending` |
| Customer submits receipt | `orders.payment_status` | `pending` |
| Admin approves receipt | `orders.payment_status` | `approved` |
| Admin rejects receipt | `orders.payment_status` | `rejected` |

```sql
-- Admin approves GCash/e-wallet payment
UPDATE orders SET payment_status = 'approved', updated_at = NOW() WHERE id = 1;

-- Admin rejects GCash/e-wallet payment
UPDATE orders SET payment_status = 'rejected', updated_at = NOW() WHERE id = 1;
```

**Example — What shows after a customer places a standard order:**
```sql
-- The orders table gets a new row:
SELECT id, order_number, customer_name, total_amount, status, gcash_ref_number, created_at
FROM orders WHERE id = 1;
```

| id | order_number | customer_name | total_amount | status | gcash_ref_number | created_at |
|---|---|---|---|---|---|---|
| 1 | MFS-260115-4827 | Juan Dela Cruz | 850.00 | pending | 1234567890123 | 2026-01-15 10:30:00 |

```sql
-- The order_items table gets the product details:
SELECT product_name, product_price, quantity, subtotal
FROM order_items WHERE order_id = 1;
```

| product_name | product_price | quantity | subtotal |
|---|---|---|---|
| Pink Rose Elegance Bouquet | 850.00 | 1 | 850.00 |

**Example — What shows after a customer places a custom order:**
```sql
-- orders table:
SELECT id, order_number, customer_name, total_amount, is_custom_order, status
FROM orders WHERE id = 2;
```

| id | order_number | customer_name | total_amount | is_custom_order | status |
|---|---|---|---|---|---|
| 2 | MFS-260115-7391 | Maria Santos | 2000.00 | 1 | pending |

```sql
-- custom_arrangements table:
SELECT description, style, occasion, budget_min, budget_max
FROM custom_arrangements WHERE order_id = 2;
```

| description | style | occasion | budget_min | budget_max |
|---|---|---|---|---|
| I want a romantic bouquet with red and pink roses for my anniversary | bouquet | anniversary | 2000.00 | 3000.00 |

```sql
-- custom_arrangement_flowers table:
SELECT flower_type FROM custom_arrangement_flowers WHERE custom_arrangement_id = 1;
```

| flower_type |
|---|
| roses |
| tulips |
| babys-breath |

```sql
-- custom_arrangement_colors table:
SELECT color FROM custom_arrangement_colors WHERE custom_arrangement_id = 1;
```

| color |
|---|
| red |
| pink |
| white |

**Admin updates order status — what changes in database:**
```sql
-- Admin clicks "Mark as Preparing":
UPDATE orders SET status = 'preparing', updated_at = NOW() WHERE id = 1;

-- Admin clicks "Mark as Ready":
UPDATE orders SET status = 'ready', updated_at = NOW() WHERE id = 1;

-- Admin clicks "Mark as Completed":
UPDATE orders SET status = 'completed', updated_at = NOW() WHERE id = 1;
```

---

### Admin Manage Reviews (`/admin-reviews`)

Initially shows **empty** — *"No Reviews Yet. Customer reviews will appear here once orders are completed and reviewed."*

Reviews appear only after:
1. Admin marks an order as **completed**
2. Customer goes to **My Orders** and writes a review on that completed order

**Example — What shows after a customer leaves a review:**
```sql
SELECT r.rating, r.comment, r.created_at, o.order_number, u.full_name
FROM reviews r
JOIN orders o ON o.id = r.order_id
JOIN users u ON u.id = r.customer_id;
```

| rating | comment | created_at | order_number | full_name |
|---|---|---|---|---|
| 5 | Beautiful bouquet! My wife loved it! | 2026-01-16 14:30:00 | MFS-260115-4827 | Juan Dela Cruz |

```sql
-- Review analytics:
SELECT ROUND(AVG(rating), 1) AS average_rating, COUNT(*) AS total_reviews FROM reviews;
```

| average_rating | total_reviews |
|---|---|
| 5.0 | 1 |

```sql
-- Rating breakdown:
SELECT rating, COUNT(*) AS count FROM reviews GROUP BY rating ORDER BY rating DESC;
```

| rating | count |
|---|---|
| 5 | 1 |

> As more customers leave reviews, the breakdown fills up across all star levels and the average updates accordingly.

---

### Admin Manage Users (`/admin-users`)

The admin can see all user accounts and modify account details. Data comes from the `users` table.

**Fresh setup:** only the default admin account exists.

```sql
SELECT id, full_name, email, username, contact_number, address, role, created_at
FROM users
ORDER BY created_at DESC;
```

| id | full_name | email | username | contact_number | address | role |
|---|---|---|---|---|---|---|
| 1 | Macel Admin | admin@macelsflowershop.com | admin | 09123456789 | Purok E, Brgy. Canipaan, Hinunangan, Southern Leyte | admin |

**Admin modify user account:**

```sql
UPDATE users
SET
    full_name = 'Updated Name',
    email = 'updated@email.com',
    username = 'updated_username',
    contact_number = '09123456789',
    address = 'Canipaan, Hinunangan, Southern Leyte',
    password = 'newpassword123',
    role = 'customer'
WHERE id = 2;
```

| Admin Action | API Endpoint | SQL Table |
|-------------|--------------|-----------|
| View all accounts | `GET /api/users` | `users` |
| Edit account | `PUT /api/users/:id` | `users` |
| Change role | `PUT /api/users/:id` | `users.role` |
| Change password | `PUT /api/users/:id` | `users.password` |

> Production note: this demo stores visible passwords for school/demo simplicity. In a real deployment, use hashed passwords and do not display passwords in the admin panel.

---

### Users Table — Initial Data

The `users` table is seeded with **only the admin account**. Customer accounts are created when users register through the website.

```sql
SELECT id, full_name, email, username, role, created_at FROM users;
```

| id | full_name | email | username | role | created_at |
|---|---|---|---|---|---|
| 1 | Macel Admin | admin@macelsflowershop.com | admin | admin | *(auto-generated)* |

**When a customer registers, a new row is added:**

| id | full_name | email | username | role | created_at |
|---|---|---|---|---|---|
| 1 | Macel Admin | admin@macelsflowershop.com | admin | admin | 2026-01-15 08:00:00 |
| 2 | Juan Dela Cruz | juan@email.com | juandc | customer | 2026-01-15 09:15:00 |
| 3 | Maria Santos | maria@email.com | maria_s | customer | 2026-01-15 10:00:00 |

---

### Summary: What's in the Database After Fresh Setup

| Table | Rows After SQL Script | Grows When... |
|-------|----------------------|--------------|
| `users` | **1** (admin only) | Customer registers an account |
| `products` | **9** (seeded flowers) | Admin adds a new product |
| `orders` | **0** | Customer places an order |
| `order_items` | **0** | Customer orders standard products |
| `custom_arrangements` | **0** | Customer submits a custom arrangement |
| `custom_arrangement_flowers` | **0** | Customer picks flower types in wizard |
| `custom_arrangement_colors` | **0** | Customer picks colors in wizard |
| `custom_arrangement_images` | **0** | Customer uploads reference photos |
| `reviews` | **0** | Customer reviews a completed order |
| `cart_items` | **0** | Customer adds items to cart |

### Admin Page → Database Table Map

| Admin Page | Tables Read | Tables Written |
|-----------|------------|---------------|
| **Dashboard** | `orders`, `users`, `products`, `reviews` | *(read-only)* |
| **Manage Products** | `products` | `products` (INSERT, UPDATE, DELETE) |
| **Manage Orders** | `orders`, `order_items`, `custom_arrangements`, `custom_arrangement_flowers`, `custom_arrangement_colors`, `custom_arrangement_images`, `reviews` | `orders` (UPDATE status) |
| **Manage Reviews** | `reviews`, `orders`, `users` | *(read-only)* |
| **Manage Users** | `users` | `users` (UPDATE account details) |

### Data Flow: Frontend → Database

```
┌─────────────────────┐
│   Admin Dashboard    │──────▶ vw_dashboard_stats (VIEW)
│   Shows: 9 products, │        ├── orders (0 rows initially)
│   0 orders, 0 reviews│        ├── users (1 admin)
│                      │        ├── products (9 seeded)
│                      │        └── reviews (0 rows initially)
├─────────────────────┤
│   Manage Products    │──────▶ products (TABLE — 9 rows)
│   Shows: 9 flowers   │        └── CRUD operations
│   with prices        │
├─────────────────────┤
│   Manage Orders      │──────▶ orders (TABLE — 0 rows initially)
│   Shows: empty until │        ├── order_items
│   customers order    │        ├── custom_arrangements
│                      │        │   ├── custom_arrangement_flowers
│                      │        │   ├── custom_arrangement_colors
│                      │        │   └── custom_arrangement_images
│                      │        └── reviews
├─────────────────────┤
│   Manage Reviews     │──────▶ vw_review_summary (VIEW)
│   Shows: empty until │        ├── reviews (0 rows initially)
│   customers review   │        ├── orders
│                      │        └── users
├─────────────────────┤
│   Manage Users       │──────▶ users (TABLE — 1 admin initially)
│   Shows: account list│        └── update account details
└─────────────────────┘
```

---

## 📦 System Modules

### Authentication Module
| Feature | Description |
|---------|-------------|
| Login | Email/username + password authentication |
| Register | Full profile creation for customers |
| Sessions | Persistent via localStorage |
| Roles | Admin and Customer with separate dashboards |

### Product Module
| Feature | Description |
|---------|-------------|
| Categories | Bouquets, Dozen Flowers, Custom Arrangements |
| Search | Real-time search by name and description |
| Filtering | Category-based filtering |
| Admin CRUD | Add, edit, update price, toggle stock, delete |

### Order Module
| Feature | Description |
|---------|-------------|
| Standard Order | Select product(s), add to cart, checkout |
| Direct Order | Buy single product instantly |
| Custom Order | 4-step wizard with flower/color/style selection |
| Reference Photos | Upload up to 5 sample images for custom orders |
| Status Tracking | Pending → Preparing → Ready → Completed |
| Order Number | Auto-generated `MFS-YYMMDD-XXXX` format |

### Payment Module (GCash)
| Feature | Description |
|---------|-------------|
| Reference Number | 13-digit GCash reference input with validation |
| Receipt Upload | Screenshot upload (JPG/PNG/WEBP, max 5MB) |
| Verification | Cross-validates reference number against receipt |
| Admin View | Full receipt and reference viewing in admin panel |

### Review Module
| Feature | Description |
|---------|-------------|
| Star Rating | 1-5 stars with hover effects and labels |
| Comments | Optional text review |
| Customer View | Submit/view reviews on completed orders |
| Admin Analytics | Rating breakdown, average, search, filter |
| Shop Display | Reviews shown on customer dashboard for social proof |

### Location Module
| Feature | Description |
|---------|-------------|
| Google Maps | Embedded interactive map on login page |
| Coordinates | 10.414779, 125.185361 |
| Directions | "Get Directions" link to Google Maps |
| Address | Canipaan, Hinunangan, Southern Leyte |

---

## 🔄 User Flow

### Customer Flow
```
Register → Login → Browse/Search Products
                        │
                ┌───────┴────────┐
                ▼                ▼
          Add to Cart    Customize Arrangement
                │         (4-step wizard)
                ▼                │
          View Cart              │
                │                │
                └───────┬────────┘
                        ▼
                    Checkout
                  (GCash Payment)
                        │
                        ▼
                Order Confirmed
                  (Order #)
                        │
                        ▼
                Track Order Status
          (Pending → Preparing → Ready → Completed)
                        │
                        ▼
                 Write Review ⭐
```

### Admin Flow
```
Login → Admin Dashboard
            │
     ┌──────┼──────┬──────────┐
     ▼      ▼      ▼          ▼
  Products Orders Reviews   Stats
   (CRUD)  (Status  (View    (Overview)
            Update)  All)
```

---

## 📸 Screenshots Overview

| Page | Description |
|------|-------------|
| Login | Split layout — branding + Google Maps on left, login form + location card on right |
| Register | Full registration form with validation |
| Dashboard | Hero banner, category tabs, product grid, customize CTA, customer reviews |
| Cart | Item list with quantity controls, order summary sidebar |
| Checkout | Personal info, pickup details, message card, GCash payment with receipt upload |
| Customize | 4-step wizard — Design → Details → Reference Photos → Checkout |
| My Orders | Order cards with progress bar, custom arrangement details, GCash info, review form |
| Profile | View/edit personal information |
| Admin Dashboard | Stats cards, status breakdown, recent orders, customer reviews, shop info |
| Admin Products | Product table/cards with add/edit/delete modals |
| Admin Orders | Order list with filters, detail modal with custom arrangements and GCash verification |
| Admin Reviews | Rating stats, breakdown chart, searchable review list with order detail modal |
| Admin Users | Account list with search and edit modal for user details, password, contact, address, and role |

---

## 🌐 Data Persistence

The current version supports two data modes:

| Mode | How It Works |
|------|--------------|
| **Database mode** | If `VITE_API_URL` is set, products, orders, reviews, and auth requests use the backend API, which reads/writes Aiven MySQL. |
| **Local fallback mode** | If no API is configured or the API is offline, the app uses localStorage so the website still works for demo/testing. |

The shopping cart still uses localStorage for a fast customer-side cart experience. When checkout is submitted, the final order can be saved to the Aiven `orders` and `order_items` tables through the backend API.

To migrate to a production backend:
1. Import the SQL schema from `database/macels_flower_shop.sql` to Aiven (see [Step 4](#step-4--create-tables-in-workbench))
2. Extend `server.js` if you want additional endpoints such as advanced reports or external image storage services
3. Implement proper password hashing (bcrypt/argon2)
4. Add JWT or session-based authentication
5. Store images in cloud storage (AWS S3, Cloudinary) instead of base64

---

## 📄 License

This project is developed for **Macel's Flower Shop**, Canipaan, Hinunangan, Southern Leyte.

---

<p align="center">
  🌹 Made with love for Macel's Flower Shop 🌹<br/>
  <sub>Purok E, Brgy. Canipaan, Hinunangan, Southern Leyte</sub><br/>
  <sub>📍 10.414779, 125.185361</sub>
</p>
