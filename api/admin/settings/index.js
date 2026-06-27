import getPool, { ensureDb } from '../../../db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  await ensureDb();
  const pool = getPool();
  try {
    const [[cafe], [printer]] = await Promise.all([
      pool.query('SELECT * FROM cafe_settings WHERE id=1'),
      pool.query('SELECT * FROM printer_settings WHERE id=1')
    ]);
    res.json({ cafe: cafe[0], printer: printer[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
