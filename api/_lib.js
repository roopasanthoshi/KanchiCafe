// Shared helper: run ensureDb before every handler
import { ensureDb } from '../db.js';

export async function withDb(handler, req, res) {
  try {
    await ensureDb();
    await handler(req, res);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

// Parse multipart/form-data manually for image uploads (base64)
export function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      const body = Buffer.concat(chunks);
      const contentType = req.headers['content-type'] || '';
      
      if (!contentType.includes('multipart/form-data')) {
        resolve({ fields: {}, file: null });
        return;
      }

      const boundaryMatch = contentType.match(/boundary=(.+)$/);
      if (!boundaryMatch) { resolve({ fields: {}, file: null }); return; }
      
      const boundary = '--' + boundaryMatch[1];
      const parts = body.toString('binary').split(boundary).slice(1, -1);
      
      const fields = {};
      let file = null;

      for (const part of parts) {
        const [headerSection, ...bodyParts] = part.split('\r\n\r\n');
        const partBody = bodyParts.join('\r\n\r\n').replace(/\r\n$/, '');
        
        const nameMatch = headerSection.match(/name="([^"]+)"/);
        const filenameMatch = headerSection.match(/filename="([^"]+)"/);
        const mimeMatch = headerSection.match(/Content-Type:\s*([^\r\n]+)/i);
        
        if (!nameMatch) continue;
        const fieldName = nameMatch[1];

        if (filenameMatch && mimeMatch) {
          const mimeType = mimeMatch[1].trim();
          const buf = Buffer.from(partBody, 'binary');
          const base64 = buf.toString('base64');
          file = {
            fieldname: fieldName,
            originalname: filenameMatch[1],
            mimetype: mimeType,
            base64: `data:${mimeType};base64,${base64}`
          };
        } else {
          fields[fieldName] = partBody;
        }
      }

      resolve({ fields, file });
    });
    req.on('error', reject);
  });
}
