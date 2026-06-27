import getPool, { ensureDb } from '../../../db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  await ensureDb();
  const pool = getPool();
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Invalid email or password.' });
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const [rows] = await pool.query('SELECT * FROM admin_users WHERE LOWER(email)=? AND password=?', [normalizedEmail, password]);
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid email or password.' });
    res.json({ success: true, email: rows[0].email });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
}
