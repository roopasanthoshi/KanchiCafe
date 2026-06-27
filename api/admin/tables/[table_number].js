import getPool, { ensureDb } from '../../../db.js';

export default async function handler(req, res) {
  await ensureDb();
  const pool = getPool();
  const { table_number } = req.query;
  try {
    if (req.method === 'PUT') {
      const { status } = req.body;
      await pool.query('UPDATE cafe_tables SET status=? WHERE table_number=?', [status, table_number]);
      return res.json({ success: true });
    }
    if (req.method === 'DELETE') {
      await pool.query('DELETE FROM cafe_tables WHERE table_number=?', [table_number]);
      return res.json({ success: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
