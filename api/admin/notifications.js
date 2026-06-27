import getPool, { ensureDb } from '../../db.js';

// Polling-based notifications endpoint (replaces SSE for Vercel compatibility)
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  await ensureDb();
  const pool = getPool();
  try {
    const [pending] = await pool.query("SELECT COUNT(*) as count FROM orders WHERE status='Pending Approval'");
    const [recent] = await pool.query(`
      SELECT id, order_number, table_number, customer_name, status, updated_at
      FROM orders 
      WHERE updated_at >= DATE_SUB(NOW(), INTERVAL 1 MINUTE)
      ORDER BY updated_at DESC LIMIT 10
    `);
    res.json({ pendingCount: pending[0].count, recentUpdates: recent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
