import getPool, { ensureDb } from '../../../../db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  await ensureDb();
  const pool = getPool();
  const { id } = req.query;
  try {
    const [ord] = await pool.query('SELECT * FROM orders WHERE id=?', [id]);
    if (ord.length === 0) return res.status(404).json({ error: 'Order not found' });
    await pool.query("UPDATE orders SET status='Pending Approval', payment_time=NOW() WHERE id=?", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
