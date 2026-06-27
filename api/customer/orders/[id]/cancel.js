import getPool, { ensureDb } from '../../../../db.js';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });
  await ensureDb();
  const pool = getPool();
  const { id } = req.query;
  try {
    const [ord] = await pool.query('SELECT created_at, status FROM orders WHERE id=?', [id]);
    if (ord.length === 0) return res.status(404).json({ error: 'Order not found' });
    const elapsedSeconds = (Date.now() - new Date(ord[0].created_at).getTime()) / 1000;
    if (elapsedSeconds >= 20 || ord[0].status !== 'Grace Period') return res.status(400).json({ error: 'Order is locked. Cannot cancel.' });
    await pool.query('UPDATE orders SET status="Cancelled" WHERE id=?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
