import getPool, { ensureDb } from '../../db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    await ensureDb();
    const pool = getPool();
    const today = new Date().toISOString().split('T')[0];

    const [[ordersCountRows], [revenueRows], [activeCountRows], [pendingCountRows],
           [occupiedTablesRows], [totalTablesRows], [reviewsRows],
           [revTrendRows], [ordersTrendRows], [topSellingRows],
           [catPerformanceRows], [recentOrdersRows], [recentActivityRows]] = await Promise.all([
      pool.query("SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = ?", [today]),
      pool.query("SELECT SUM(total_amount) as total FROM orders WHERE DATE(created_at) = ? AND status NOT IN ('Cancelled','Pending Payment','Pending Approval')", [today]),
      pool.query("SELECT COUNT(*) as count FROM orders WHERE status IN ('Preparing','Ready')"),
      pool.query("SELECT COUNT(*) as count FROM orders WHERE status = 'Pending Approval'"),
      pool.query("SELECT COUNT(*) as count FROM cafe_tables WHERE status = 'Occupied'"),
      pool.query("SELECT COUNT(*) as count FROM cafe_tables"),
      pool.query("SELECT COUNT(*) as count FROM reviews"),
      pool.query("SELECT DATE_FORMAT(created_at,'%a') as day, SUM(total_amount) as total FROM orders WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) AND status NOT IN ('Cancelled','Pending Payment','Pending Approval') GROUP BY DATE(created_at),day ORDER BY DATE(created_at) ASC"),
      pool.query("SELECT DATE_FORMAT(created_at,'%a') as day, COUNT(*) as count FROM orders WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) GROUP BY DATE(created_at),day ORDER BY DATE(created_at) ASC"),
      pool.query("SELECT item_name as name, SUM(quantity) as value FROM order_items oi JOIN orders o ON oi.order_id=o.id WHERE o.status NOT IN ('Cancelled') GROUP BY item_name ORDER BY value DESC LIMIT 5"),
      pool.query("SELECT c.name, SUM(oi.quantity*oi.price) as value FROM order_items oi JOIN menu_items mi ON oi.menu_item_id=mi.id JOIN categories c ON mi.category_id=c.id JOIN orders o ON oi.order_id=o.id WHERE o.status NOT IN ('Cancelled') GROUP BY c.name ORDER BY value DESC"),
      pool.query("SELECT id, order_number, table_number, customer_name, total_amount, status, created_at FROM orders ORDER BY created_at DESC LIMIT 10"),
      pool.query("SELECT o.id, o.order_number, o.table_number, o.customer_name, o.status, o.updated_at as time FROM orders o ORDER BY o.updated_at DESC LIMIT 10")
    ]);

    const activities = recentActivityRows.map(act => {
      let message = '';
      if (act.status === 'Grace Period') message = `Order ${act.order_number} confirmed, grace period started for Table ${act.table_number}.`;
      else if (act.status === 'Pending Approval') message = `Payment submitted for Order ${act.order_number} (Table ${act.table_number}), pending approval.`;
      else if (act.status === 'Preparing') message = `Payment approved. Order ${act.order_number} (Table ${act.table_number}) is in Kitchen.`;
      else if (act.status === 'Ready') message = `Order ${act.order_number} for Table ${act.table_number} marked Ready.`;
      else if (act.status === 'Delivered') message = `Order ${act.order_number} delivered to Table ${act.table_number}.`;
      else if (act.status === 'Cancelled') message = `Order ${act.order_number} was Cancelled.`;
      else message = `Order ${act.order_number} status updated to ${act.status}.`;
      return { id: act.id, message, time: act.time };
    });

    res.json({
      metrics: {
        todayOrders: ordersCountRows[0].count,
        todayRevenue: Number(revenueRows[0].total || 0),
        activeOrders: activeCountRows[0].count,
        pendingApprovals: pendingCountRows[0].count,
        occupiedTables: `${occupiedTablesRows[0].count}/${totalTablesRows[0].count}`,
        totalReviews: reviewsRows[0].count
      },
      charts: {
        revenueTrend: revTrendRows,
        ordersTrend: ordersTrendRows,
        topSelling: topSellingRows,
        categoryPerformance: catPerformanceRows
      },
      recentOrders: recentOrdersRows,
      recentActivity: activities
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
}
