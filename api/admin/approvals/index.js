import getPool, { ensureDb } from '../../../db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  await ensureDb();
  const pool = getPool();
  try {
    const [orders] = await pool.query("SELECT * FROM orders WHERE status='Pending Approval' ORDER BY payment_time DESC");
    for (const order of orders) {
      const [items] = await pool.query('SELECT * FROM order_items WHERE order_id=?', [order.id]);
      order.items = items;
    }
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
