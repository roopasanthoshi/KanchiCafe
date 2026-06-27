import getPool, { ensureDb } from '../../../db.js';

export default async function handler(req, res) {
  await ensureDb();
  const pool = getPool();
  const { id } = req.query;
  try {
    if (req.method === 'PUT') {
      const { name, slug, display_order, status } = req.body;
      await pool.query('UPDATE categories SET name=?, slug=?, display_order=?, status=? WHERE id=?', [name, slug, display_order, status, id]);
      return res.json({ success: true });
    }
    if (req.method === 'DELETE') {
      await pool.query('DELETE FROM categories WHERE id=?', [id]);
      return res.json({ success: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
