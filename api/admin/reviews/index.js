import getPool, { ensureDb } from '../../../db.js';

export default async function handler(req, res) {
  await ensureDb();
  const pool = getPool();
  try {
    if (req.method === 'GET') {
      const [rows] = await pool.query('SELECT * FROM reviews ORDER BY created_at DESC');
      const [avgRow] = await pool.query('SELECT AVG(rating) as avg_rating FROM reviews');
      return res.json({ reviews: rows, average: Number(avgRow[0].avg_rating || 0).toFixed(1) });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
