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
    month_ending TEXT NOT NULL,
    pay_date TEXT,
    pay_via TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  );

  CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    subsection TEXT NOT NULL,
    seat_number TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    duration_months INTEGER NOT NULL,
    amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    pay_via TEXT,
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
  const insertBill = db.prepare('INSERT INTO bills (customer_id, amount, status, due_date, month_ending, pay_date, pay_via, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  const insertNotification = db.prepare('INSERT INTO notifications (customer_id, message, status, sent_at) VALUES (?, ?, ?, ?)');

  const today = new Date().toISOString();
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString();
  const lastMonth = new Date(Date.now() - 30 * 86400000).toISOString();
  
  const c1 = insertCustomer.run('Acme Corp', 'contact@acmecorp.com', '555-0100', today);
  const c2 = insertCustomer.run('Globex Inc', 'info@globex.com', '555-0200', today);
  const c3 = insertCustomer.run('Initech', 'billing@initech.com', '555-0300', today);

  insertInteraction.run(c1.lastInsertRowid, 'email', 'Sent initial proposal', today);
  insertInteraction.run(c2.lastInsertRowid, 'call', 'Discussed requirements', today);

  insertBill.run(c1.lastInsertRowid, 1500.00, 'paid', today, '2026-02-28', today, 'Credit Card', today);
  insertBill.run(c2.lastInsertRowid, 3200.50, 'pending', nextWeek, '2026-03-31', null, 'Bank Transfer', today);
  insertBill.run(c3.lastInsertRowid, 850.00, 'overdue', lastMonth, '2026-01-31', null, 'UPI', today);

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
    const amountToBePaid = (db.prepare("SELECT SUM(amount) as total FROM bills WHERE status = 'pending'").get() as any).total || 0;
    const overdueAmount = (db.prepare("SELECT SUM(amount) as total FROM bills WHERE status = 'overdue'").get() as any).total || 0;
    const totalNotifications = (db.prepare('SELECT COUNT(*) as count FROM notifications').get() as any).count;

    const avgDueDaysResult = db.prepare("SELECT AVG(julianday('now') - julianday(due_date)) as avgDays FROM bills WHERE status = 'overdue'").get() as any;
    const averageDueDays = avgDueDaysResult.avgDays ? Math.round(avgDueDaysResult.avgDays) : 0;

    const payViaStats = db.prepare("SELECT pay_via, COUNT(*) as count FROM bills WHERE status = 'paid' AND pay_via IS NOT NULL GROUP BY pay_via").all();

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
      amountToBePaid,
      overdueAmount,
      averageDueDays,
      payViaStats,
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
      SELECT bills.*, customers.name as customer_name, customers.phone as customer_phone
      FROM bills 
      JOIN customers ON bills.customer_id = customers.id 
      ORDER BY bills.created_at DESC
    `).all();
    res.json(bills);
  });

  app.post('/api/bills', (req, res) => {
    const { customer_id, amount, due_date, month_ending, pay_via } = req.body;
    try {
      const info = db.prepare('INSERT INTO bills (customer_id, amount, due_date, month_ending, pay_via, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(
        customer_id, amount, due_date, month_ending, pay_via || 'Bank Transfer', new Date().toISOString()
      );
      const newBill = db.prepare(`
        SELECT bills.*, customers.name as customer_name, customers.phone as customer_phone
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
      if (status === 'paid') {
        db.prepare('UPDATE bills SET status = ?, pay_date = ? WHERE id = ?').run(status, new Date().toISOString(), req.params.id);
      } else {
        db.prepare('UPDATE bills SET status = ? WHERE id = ?').run(status, req.params.id);
      }
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

  // Reservations
  app.get('/api/reservations', (req, res) => {
    const reservations = db.prepare(`
      SELECT reservations.*, customers.name as customer_name 
      FROM reservations 
      JOIN customers ON reservations.customer_id = customers.id 
      ORDER BY reservations.created_at DESC
    `).all();
    res.json(reservations);
  });

  app.post('/api/reservations', (req, res) => {
    const { customer_id, subsection, seat_number, start_date, end_date, duration_months, amount, pay_via } = req.body;
    try {
      const info = db.prepare('INSERT INTO reservations (customer_id, subsection, seat_number, start_date, end_date, duration_months, amount, pay_via, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
        customer_id, subsection, seat_number, start_date, end_date, duration_months, amount, pay_via, new Date().toISOString()
      );
      const newReservation = db.prepare(`
        SELECT reservations.*, customers.name as customer_name 
        FROM reservations 
        JOIN customers ON reservations.customer_id = customers.id 
        WHERE reservations.id = ?
      `).get(info.lastInsertRowid);
      res.json(newReservation);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.patch('/api/reservations/:id/status', (req, res) => {
    const { status } = req.body;
    try {
      db.prepare('UPDATE reservations SET status = ? WHERE id = ?').run(status, req.params.id);
      res.json({ success: true });
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
