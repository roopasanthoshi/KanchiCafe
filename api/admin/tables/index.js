import getPool, { ensureDb } from '../../../db.js';

export default async function handler(req, res) {
  await ensureDb();
  const pool = getPool();
  try {
    if (req.method === 'GET') {
      const [rows] = await pool.query('SELECT * FROM cafe_tables ORDER BY table_number ASC');
      return res.json(rows);
    }
    if (req.method === 'POST') {
      const { table_number, status } = req.body;
      if (!table_number) return res.status(400).json({ error: 'Table number is required' });
      await pool.query('INSERT INTO cafe_tables (table_number, status) VALUES (?, ?)', [table_number, status || 'Available']);
      return res.json({ success: true, table_number });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: 'Table already exists or DB error: ' + err.message });
  }
}
