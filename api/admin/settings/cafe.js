import getPool, { ensureDb } from '../../../db.js';
import { parseMultipart } from '../../_lib.js';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });
  await ensureDb();
  const pool = getPool();
  try {
    const ct = req.headers['content-type'] || '';
    let cafe_name, address, phone, gst_number, gst_percentage, upi_id, fileBase64;

    if (ct.includes('multipart/form-data')) {
      const { fields, file } = await parseMultipart(req);
      ({ cafe_name, address, phone, gst_number, gst_percentage, upi_id } = fields);
      if (file) fileBase64 = file.base64;
    } else {
      ({ cafe_name, address, phone, gst_number, gst_percentage, upi_id } = req.body || {});
    }

    let query = 'UPDATE cafe_settings SET cafe_name=?, address=?, phone=?, gst_number=?, gst_percentage=?, upi_id=?';
    let params = [cafe_name, address, phone, gst_number, gst_percentage, upi_id];
    if (fileBase64) { query += ', logo_url=?'; params.push(fileBase64); }
    query += ' WHERE id=1';
    await pool.query(query, params);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
