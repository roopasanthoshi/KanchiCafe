import getPool, { ensureDb } from '../../../db.js';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });
  await ensureDb();
  const pool = getPool();
  const { id } = req.query;
  try {
    await pool.query('DELETE FROM reviews WHERE id=?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
