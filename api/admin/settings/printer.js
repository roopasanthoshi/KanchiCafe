import getPool, { ensureDb } from '../../../db.js';

export default async function handler(req, res) {
  await ensureDb();
  const pool = getPool();
  if (req.method === 'PUT') {
    const { printer_name, ip_address, port } = req.body;
    try {
      await pool.query('UPDATE printer_settings SET printer_name=?, ip_address=?, port=? WHERE id=1', [printer_name, ip_address, port]);
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
  if (req.method === 'POST') {
    // test connection mock
    const { ip_address, port } = req.body;
    return res.json({ success: true, message: `Connected to printer at ${ip_address}:${port} successfully!` });
  }
  res.status(405).json({ error: 'Method not allowed' });
}
