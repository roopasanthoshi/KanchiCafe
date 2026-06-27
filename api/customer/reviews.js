import getPool, { ensureDb } from '../../db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  await ensureDb();
  const pool = getPool();
  const { orderId, rating, reviewText } = req.body;
  if (!rating) return res.status(400).json({ error: 'Rating is required' });
  try {
    await pool.query('INSERT INTO reviews (order_id, rating, review_text) VALUES (?, ?, ?)', [orderId || null, rating, reviewText || '']);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
