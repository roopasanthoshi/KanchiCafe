import getPool, { ensureDb } from '../../db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  await ensureDb();
  const pool = getPool();
  const { type, startDate, endDate } = req.query;

  let dateFilter = '';
  let dateFilterOrders = '';
  const params = [];
  const paramsOrders = [];

  if (type === 'daily') {
    dateFilter = 'DATE(created_at) = CURDATE()';
    dateFilterOrders = 'DATE(o.created_at) = CURDATE()';
  } else if (type === 'weekly') {
    dateFilter = 'created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
    dateFilterOrders = 'o.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
  } else if (type === 'monthly') {
    dateFilter = 'created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
    dateFilterOrders = 'o.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
  } else if (type === 'custom' && startDate && endDate) {
    dateFilter = 'DATE(created_at) BETWEEN ? AND ?';
    dateFilterOrders = 'DATE(o.created_at) BETWEEN ? AND ?';
    params.push(startDate, endDate);
    paramsOrders.push(startDate, endDate);
  } else {
    dateFilter = '1=1';
    dateFilterOrders = '1=1';
  }

  const queryCondition = `(${dateFilter}) AND status NOT IN ('Cancelled','Pending Payment','Pending Approval','Grace Period')`;
  const queryConditionOrders = `o.status NOT IN ('Cancelled','Pending Payment','Pending Approval','Grace Period') AND (${dateFilterOrders})`;

  try {
    const [[rev], [ord], [trend], [peakHours], [catPerf], [bestSelling], [topRevenue]] = await Promise.all([
      pool.query(`SELECT COALESCE(SUM(total_amount),0) as value FROM orders WHERE ${queryCondition}`, params),
      pool.query(`SELECT COUNT(*) as value FROM orders WHERE ${queryCondition}`, params),
      pool.query(`SELECT DATE(created_at) as date, DATE_FORMAT(created_at,'%b %d') as formatted_date, COUNT(*) as count, COALESCE(SUM(total_amount),0) as revenue FROM orders WHERE ${queryCondition} GROUP BY DATE(created_at), DATE_FORMAT(created_at,'%b %d') ORDER BY DATE(created_at) ASC`, params),
      pool.query(`SELECT HOUR(created_at) as hour, COUNT(*) as count FROM orders WHERE ${queryCondition} GROUP BY HOUR(created_at) ORDER BY count DESC`, params),
      pool.query(`SELECT c.name, COALESCE(SUM(oi.quantity*oi.price),0) as value FROM order_items oi JOIN menu_items mi ON oi.menu_item_id=mi.id JOIN categories c ON mi.category_id=c.id JOIN orders o ON oi.order_id=o.id WHERE ${queryConditionOrders} GROUP BY c.id,c.name ORDER BY value DESC`, paramsOrders),
      pool.query(`SELECT oi.item_name as name, COALESCE(SUM(oi.quantity),0) as value FROM order_items oi JOIN orders o ON oi.order_id=o.id WHERE ${queryConditionOrders} GROUP BY oi.item_name ORDER BY value DESC LIMIT 10`, paramsOrders),
      pool.query(`SELECT oi.item_name as name, COALESCE(SUM(oi.quantity*oi.price),0) as value FROM order_items oi JOIN orders o ON oi.order_id=o.id WHERE ${queryConditionOrders} GROUP BY oi.item_name ORDER BY value DESC LIMIT 10`, paramsOrders)
    ]);

    res.json({
      summary: { revenue: Number(rev[0]?.value || 0), ordersCount: Number(ord[0]?.value || 0) },
      ordersTrend: trend || [],
      peakHours: peakHours || [],
      categoryPerformance: catPerf || [],
      bestSelling: bestSelling || [],
      topRevenue: topRevenue || []
    });
  } catch (err) {
    console.error('Reports error:', err);
    res.status(500).json({ summary: { revenue: 0, ordersCount: 0 }, ordersTrend: [], peakHours: [], categoryPerformance: [], bestSelling: [], topRevenue: [], error: err.message });
  }
}
