import getPool, { ensureDb } from '../../db.js';

export default async function handler(req, res) {
  await ensureDb();
  const pool = getPool();
  try {
    if (req.method === 'GET') {
      const [rows] = await pool.query('SELECT * FROM categories ORDER BY display_order ASC');
      return res.json(rows);
    }
    if (req.method === 'POST') {
      const { name, slug, display_order, status } = req.body;
      if (!name || !slug) return res.status(400).json({ error: 'Name and slug are required' });
      const [result] = await pool.query(
        'INSERT INTO categories (name, slug, display_order, status) VALUES (?, ?, ?, ?)',
        [name, slug, display_order || 0, status || 'Active']
      );
      return res.json({ id: result.insertId, name, slug, display_order, status });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
