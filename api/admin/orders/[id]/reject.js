import getPool, { ensureDb } from '../../../../db.js';

export default async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });
  await ensureDb();
  const pool = getPool();
  const { id } = req.query;
  const { reason } = req.body;
  try {
    const [ord] = await pool.query('SELECT table_number, order_number FROM orders WHERE id=?', [id]);
    if (ord.length === 0) return res.status(404).json({ error: 'Order not found' });
    await pool.query('UPDATE orders SET status="Cancelled", rejection_reason=? WHERE id=?', [reason || 'Payment rejected by cashier', id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
