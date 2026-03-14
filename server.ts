import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('business.db');

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    first_contact TEXT NOT NULL,
    status TEXT DEFAULT 'active'
  );

  CREATE TABLE IF NOT EXISTS interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    notes TEXT,
    date TEXT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  );

  CREATE TABLE IF NOT EXISTS bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    due_date TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'sent',
    sent_at TEXT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  );
`);

// Seed initial data if empty
const count = db.prepare('SELECT COUNT(*) as count FROM customers').get() as { count: number };
if (count.count === 0) {
  const insertCustomer = db.prepare('INSERT INTO customers (name, email, phone, first_contact) VALUES (?, ?, ?, ?)');
  const insertInteraction = db.prepare('INSERT INTO interactions (customer_id, type, notes, date) VALUES (?, ?, ?, ?)');
  const insertBill = db.prepare('INSERT INTO bills (customer_id, amount, status, due_date, created_at) VALUES (?, ?, ?, ?, ?)');
  const insertNotification = db.prepare('INSERT INTO notifications (customer_id, message, status, sent_at) VALUES (?, ?, ?, ?)');

  const today = new Date().toISOString();
  
  const c1 = insertCustomer.run('Acme Corp', 'contact@acmecorp.com', '555-0100', today);
  const c2 = insertCustomer.run('Globex Inc', 'info@globex.com', '555-0200', today);

  insertInteraction.run(c1.lastInsertRowid, 'email', 'Sent initial proposal', today);
  insertInteraction.run(c2.lastInsertRowid, 'call', 'Discussed requirements', today);

  insertBill.run(c1.lastInsertRowid, 1500.00, 'paid', today, today);
  insertBill.run(c2.lastInsertRowid, 3200.50, 'pending', new Date(Date.now() + 7 * 86400000).toISOString(), today);

  insertNotification.run(c1.lastInsertRowid, 'Welcome to our service!', 'sent', today);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---

  // Dashboard Stats
  app.get('/api/stats', (req, res) => {
    const totalCustomers = (db.prepare('SELECT COUNT(*) as count FROM customers').get() as any).count;
    const totalRevenue = (db.prepare("SELECT SUM(amount) as total FROM bills WHERE status = 'paid'").get() as any).total || 0;
    const pendingBills = (db.prepare("SELECT COUNT(*) as count FROM bills WHERE status = 'pending'").get() as any).count;
    const totalNotifications = (db.prepare('SELECT COUNT(*) as count FROM notifications').get() as any).count;

    // Revenue over time (mocked for simplicity, grouping by date)
    const revenueData = db.prepare(`
      SELECT date(created_at) as date, SUM(amount) as revenue 
      FROM bills 
      WHERE status = 'paid' 
      GROUP BY date(created_at)
      ORDER BY date(created_at) DESC
      LIMIT 7
    `).all();

    res.json({
      totalCustomers,
      totalRevenue,
      pendingBills,
      totalNotifications,
      revenueData: revenueData.reverse()
    });
  });

  // Customers
  app.get('/api/customers', (req, res) => {
    const customers = db.prepare('SELECT * FROM customers ORDER BY id DESC').all();
    res.json(customers);
  });

  app.post('/api/customers', (req, res) => {
    const { name, email, phone } = req.body;
    try {
      const info = db.prepare('INSERT INTO customers (name, email, phone, first_contact) VALUES (?, ?, ?, ?)').run(
        name, email, phone, new Date().toISOString()
      );
      const newCustomer = db.prepare('SELECT * FROM customers WHERE id = ?').get(info.lastInsertRowid);
      res.json(newCustomer);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Interactions
  app.get('/api/customers/:id/interactions', (req, res) => {
    const interactions = db.prepare('SELECT * FROM interactions WHERE customer_id = ? ORDER BY date DESC').all(req.params.id);
    res.json(interactions);
  });

  app.post('/api/interactions', (req, res) => {
    const { customer_id, type, notes } = req.body;
    try {
      const info = db.prepare('INSERT INTO interactions (customer_id, type, notes, date) VALUES (?, ?, ?, ?)').run(
        customer_id, type, notes, new Date().toISOString()
      );
      const newInteraction = db.prepare('SELECT * FROM interactions WHERE id = ?').get(info.lastInsertRowid);
      res.json(newInteraction);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Bills
  app.get('/api/bills', (req, res) => {
    const bills = db.prepare(`
      SELECT bills.*, customers.name as customer_name 
      FROM bills 
      JOIN customers ON bills.customer_id = customers.id 
      ORDER BY bills.created_at DESC
    `).all();
    res.json(bills);
  });

  app.post('/api/bills', (req, res) => {
    const { customer_id, amount, due_date } = req.body;
    try {
      const info = db.prepare('INSERT INTO bills (customer_id, amount, due_date, created_at) VALUES (?, ?, ?, ?)').run(
        customer_id, amount, due_date, new Date().toISOString()
      );
      const newBill = db.prepare(`
        SELECT bills.*, customers.name as customer_name 
        FROM bills 
        JOIN customers ON bills.customer_id = customers.id 
        WHERE bills.id = ?
      `).get(info.lastInsertRowid);
      res.json(newBill);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.patch('/api/bills/:id/status', (req, res) => {
    const { status } = req.body;
    try {
      db.prepare('UPDATE bills SET status = ? WHERE id = ?').run(status, req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Notifications
  app.get('/api/notifications', (req, res) => {
    const notifications = db.prepare(`
      SELECT notifications.*, customers.name as customer_name 
      FROM notifications 
      JOIN customers ON notifications.customer_id = customers.id 
      ORDER BY notifications.sent_at DESC
    `).all();
    res.json(notifications);
  });

  app.post('/api/notifications', (req, res) => {
    const { customer_id, message } = req.body;
    try {
      const info = db.prepare('INSERT INTO notifications (customer_id, message, sent_at) VALUES (?, ?, ?)').run(
        customer_id, message, new Date().toISOString()
      );
      const newNotification = db.prepare(`
        SELECT notifications.*, customers.name as customer_name 
        FROM notifications 
        JOIN customers ON notifications.customer_id = customers.id 
        WHERE notifications.id = ?
      `).get(info.lastInsertRowid);
      res.json(newNotification);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
