import getPool, { ensureDb } from '../../../db.js';
import { parseMultipart } from '../../_lib.js';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  await ensureDb();
  const pool = getPool();
  try {
    if (req.method === 'GET') {
      const [rows] = await pool.query(`
        SELECT m.*, c.name as category_name 
        FROM menu_items m 
        JOIN categories c ON m.category_id = c.id 
        ORDER BY c.display_order ASC, m.name ASC
      `);
      return res.json(rows);
    }
    if (req.method === 'POST') {
      const ct = req.headers['content-type'] || '';
      let name, category_id, price, description, is_available, image_url, fileBase64;

      if (ct.includes('multipart/form-data')) {
        const { fields, file } = await parseMultipart(req);
        ({ name, category_id, price, description, is_available, image_url } = fields);
        if (file) fileBase64 = file.base64;
      } else {
        ({ name, category_id, price, description, is_available, image_url } = req.body || {});
      }

      if (!name || !category_id || !price) return res.status(400).json({ error: 'Name, Category and Price are required' });
      const finalImage = fileBase64 || image_url || '';
      const [result] = await pool.query(
        'INSERT INTO menu_items (name, category_id, price, description, image_url, is_available) VALUES (?, ?, ?, ?, ?, ?)',
        [name, category_id, price, description, finalImage, is_available === 'false' ? 0 : 1]
      );
      return res.json({ id: result.insertId, success: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
