import getPool, { ensureDb } from '../../../../db.js';

export default async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });
  await ensureDb();
  const pool = getPool();
  const { id } = req.query;
  const { status } = req.body;
  try {
    const [ord] = await pool.query('SELECT table_number, order_number FROM orders WHERE id=?', [id]);
    if (ord.length === 0) return res.status(404).json({ error: 'Order not found' });
    await pool.query('UPDATE orders SET status=? WHERE id=?', [status, id]);
    if (status === 'Delivered') {
      await pool.query('UPDATE cafe_tables SET status="Available" WHERE table_number=?', [ord[0].table_number]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
