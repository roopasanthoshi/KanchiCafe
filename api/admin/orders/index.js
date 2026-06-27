import getPool, { ensureDb } from '../../../db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  await ensureDb();
  const pool = getPool();
  const { status } = req.query;
  let query = `
    SELECT o.*, GROUP_CONCAT(CONCAT(oi.item_name, ' x ', oi.quantity) SEPARATOR ', ') as items_summary 
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
  `;
  const params = [];
  if (status && status !== 'All Statuses') {
    query += ' WHERE o.status = ?';
    params.push(status);
  } else {
    query += " WHERE o.status IN ('Preparing','Ready','Delivered','Cancelled')";
  }
  query += ' GROUP BY o.id ORDER BY o.created_at DESC';
  try {
    const [orders] = await pool.query(query, params);
    for (const order of orders) {
      const [items] = await pool.query('SELECT * FROM order_items WHERE order_id=?', [order.id]);
      order.items = items;
    }
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
