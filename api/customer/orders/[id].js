import getPool, { ensureDb } from '../../../db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  await ensureDb();
  const pool = getPool();
  const { id } = req.query;
  try {
    const [ord] = await pool.query('SELECT * FROM orders WHERE id=?', [id]);
    if (ord.length === 0) return res.status(404).json({ error: 'Order not found' });
    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id=?', [id]);
    const createdTime = new Date(ord[0].created_at).getTime();
    const elapsedSeconds = (Date.now() - createdTime) / 1000;
    const remainingSeconds = Math.max(0, Math.floor(20 - elapsedSeconds));
    res.json({ order: ord[0], items, remainingSeconds, isLocked: elapsedSeconds >= 20 || ord[0].status !== 'Grace Period' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
