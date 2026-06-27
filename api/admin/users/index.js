import getPool, { ensureDb } from '../../../db.js';

export default async function handler(req, res) {
  await ensureDb();
  const pool = getPool();
  try {
    if (req.method === 'GET') {
      const [rows] = await pool.query('SELECT id, email, created_at FROM admin_users ORDER BY created_at DESC');
      return res.json(rows);
    }
    if (req.method === 'POST') {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
      await pool.query('INSERT INTO admin_users (email, password) VALUES (?, ?)', [email.trim().toLowerCase(), password]);
      return res.json({ success: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'A user with this email already exists.' });
    res.status(500).json({ error: err.message });
  }
}
