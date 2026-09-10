-- Subly Cloudflare D1 Database Schema

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  whatsapp TEXT UNIQUE NOT NULL,
  email TEXT,
  password TEXT,
  registered_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  customer_whatsapp TEXT NOT NULL,
  service_id TEXT,
  service_name TEXT NOT NULL,
  logo_url TEXT,
  plan_price TEXT,
  period TEXT,
  start_date TEXT,
  expiry_date TEXT NOT NULL,
  status TEXT DEFAULT 'Active',
  FOREIGN KEY (customer_whatsapp) REFERENCES customers(whatsapp) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT,
  service_id TEXT,
  service_name TEXT NOT NULL,
  price TEXT,
  period TEXT,
  logo_url TEXT,
  status TEXT DEFAULT 'Dispatched to WhatsApp',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_subs_customer ON subscriptions(customer_whatsapp);
CREATE INDEX IF NOT EXISTS idx_subs_expiry ON subscriptions(expiry_date);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);

CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5,
  category TEXT DEFAULT 'General Experience',
  message TEXT NOT NULL,
  status TEXT DEFAULT 'New',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback(created_at);

