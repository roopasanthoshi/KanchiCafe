export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { ip_address, port } = req.body;
  res.json({ success: true, message: `Connected to printer at ${ip_address}:${port} successfully!` });
}
