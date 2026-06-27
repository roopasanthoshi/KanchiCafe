import getPool, { ensureDb } from '../../../db.js';

export default async function handler(req, res) {
  await ensureDb();
  const pool = getPool();
  try {
    if (req.method === 'GET') {
      const { mobile } = req.query;
      if (!mobile) return res.status(400).json({ error: 'Mobile number is required' });
      const [orders] = await pool.query('SELECT * FROM orders WHERE customer_mobile=? ORDER BY created_at DESC', [mobile]);
      for (const order of orders) {
        const [items] = await pool.query('SELECT * FROM order_items WHERE order_id=?', [order.id]);
        order.items = items;
      }
      return res.json(orders);
    }
    if (req.method === 'POST') {
      const { tableNumber, customerName, customerMobile, items, notes } = req.body;
      if (!tableNumber || !customerName || !customerMobile || !items || items.length === 0) {
        return res.status(400).json({ error: 'Missing required order details' });
      }
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();
        const [maxIdRow] = await conn.query('SELECT MAX(id) as maxId FROM orders');
        const nextId = (maxIdRow[0].maxId || 0) + 1;
        const orderNumber = `KC-${1000 + nextId}`;
        let totalAmount = 0;
        for (const item of items) {
          const [mi] = await conn.query('SELECT price FROM menu_items WHERE id=?', [item.id]);
          if (mi.length === 0) throw new Error(`Item ${item.name} not found`);
          totalAmount += mi[0].price * item.quantity;
        }
        const [orderResult] = await conn.query(
          "INSERT INTO orders (order_number, table_number, customer_name, customer_mobile, status, total_amount, notes) VALUES (?, ?, ?, ?, 'Grace Period', ?, ?)",
          [orderNumber, tableNumber, customerName, customerMobile, totalAmount, notes]
        );
        const orderId = orderResult.insertId;
        for (const item of items) {
          const [mi] = await conn.query('SELECT price, name FROM menu_items WHERE id=?', [item.id]);
          await conn.query(
            'INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, price) VALUES (?, ?, ?, ?, ?)',
            [orderId, item.id, mi[0].name, item.quantity, mi[0].price]
          );
        }
        await conn.commit();
        res.json({ success: true, orderId, orderNumber });
      } catch (err) {
        await conn.rollback();
        throw err;
      } finally {
        conn.release();
      }
      return;
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
