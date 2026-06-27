import getPool, { ensureDb } from '../../../db.js';
import { parseMultipart } from '../../_lib.js';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  await ensureDb();
  const pool = getPool();
  const { id } = req.query;
  try {
    if (req.method === 'PUT') {
      const ct = req.headers['content-type'] || '';
      let name, category_id, price, description, is_available, image_url, fileBase64;

      if (ct.includes('multipart/form-data')) {
        const { fields, file } = await parseMultipart(req);
        ({ name, category_id, price, description, is_available, image_url } = fields);
        if (file) fileBase64 = file.base64;
      } else {
        ({ name, category_id, price, description, is_available, image_url } = req.body || {});
      }

      let query = 'UPDATE menu_items SET name=?, category_id=?, price=?, description=?, is_available=?';
      let params = [name, category_id, price, description, is_available === 'false' ? 0 : 1];

      if (fileBase64) {
        query += ', image_url=?';
        params.push(fileBase64);
      } else if (image_url !== undefined) {
        query += ', image_url=?';
        params.push(image_url);
      }
      query += ' WHERE id=?';
      params.push(id);

      await pool.query(query, params);
      return res.json({ success: true });
    }
    if (req.method === 'DELETE') {
      await pool.query('DELETE FROM menu_items WHERE id=?', [id]);
      return res.json({ success: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
