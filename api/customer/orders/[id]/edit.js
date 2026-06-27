import getPool, { ensureDb } from '../../../../db.js';

export default async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });
  await ensureDb();
  const pool = getPool();
  const { id } = req.query;
  const { items, notes } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [ord] = await conn.query('SELECT created_at, status FROM orders WHERE id=?', [id]);
    if (ord.length === 0) { conn.release(); return res.status(404).json({ error: 'Order not found' }); }
    const elapsedSeconds = (Date.now() - new Date(ord[0].created_at).getTime()) / 1000;
    if (elapsedSeconds >= 20 || ord[0].status !== 'Grace Period') {
      conn.release();
      return res.status(400).json({ error: 'Order is locked. Grace period has expired.' });
    }
    let totalAmount = 0;
    await conn.query('DELETE FROM order_items WHERE order_id=?', [id]);
    for (const item of items) {
      const [mi] = await conn.query('SELECT price, name FROM menu_items WHERE id=?', [item.id]);
      totalAmount += mi[0].price * item.quantity;
      await conn.query('INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, price) VALUES (?, ?, ?, ?, ?)', [id, item.id, mi[0].name, item.quantity, mi[0].price]);
    }
    await conn.query('UPDATE orders SET total_amount=?, notes=? WHERE id=?', [totalAmount, notes || '', id]);
    await conn.commit();
    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
}
