import getPool, { ensureDb } from '../../db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  await ensureDb();
  const pool = getPool();
  try {
    const [[categories], [items]] = await Promise.all([
      pool.query('SELECT * FROM categories WHERE status="Active" ORDER BY display_order ASC'),
      pool.query('SELECT m.*, c.name as category_name FROM menu_items m JOIN categories c ON m.category_id=c.id WHERE m.is_available=TRUE')
    ]);
    res.json({ categories, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
