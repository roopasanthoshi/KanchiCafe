import getPool, { ensureDb } from '../../../db.js';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });
  await ensureDb();
  const pool = getPool();
  try {
    await pool.query('DELETE FROM admin_users WHERE id=?', [req.query.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
