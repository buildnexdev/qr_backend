import express from 'express';
import pool from '../../db.js';

const router = express.Router();

/** Same rules as qr_admin Tables link builder */
function slugifyPathSegment(raw) {
  return String(raw || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * GET /api/public/table-context/:companySlug/:tableKey
 * Also registered directly on `app` in server.js so it always matches.
 */
export async function tableContextHandler(req, res) {
  try {
    const { companySlug, tableKey } = req.params;
    const cs = slugifyPathSegment(companySlug);
    const tkRaw = decodeURIComponent(tableKey);
    const tkSlug = slugifyPathSegment(tkRaw);

    const [tablesRows] = await pool.query('SELECT * FROM tables ORDER BY id ASC');
    let table = null;
    for (const t of tablesRows) {
      if (String(t.id) === tkRaw) {
        table = t;
        break;
      }
      const codeSlug =
        t.table_code != null && String(t.table_code).trim() !== ''
          ? slugifyPathSegment(String(t.table_code))
          : '';
      const nameSlug = slugifyPathSegment(String(t.name || ''));
      if (codeSlug && codeSlug === tkSlug) {
        table = t;
        break;
      }
      if (nameSlug && nameSlug === tkSlug) {
        table = t;
        break;
      }
    }
    if (!table) {
      return res.status(404).json({ error: 'Table not found' });
    }

    let companyName = 'Restaurant';
    let companies = [];
    try {
      const [rows] = await pool.query(
        'SELECT id, company_name, company_code FROM tblCompany ORDER BY id ASC'
      );
      companies = rows || [];
    } catch (err) {
      console.warn('publicRoutes: tblCompany query skipped:', err.message);
    }

    if (companies.length > 1) {
      let match = companies.find(
        (c) =>
          slugifyPathSegment(c.company_name) === cs ||
          (c.company_code && slugifyPathSegment(String(c.company_code)) === cs)
      );
      const genericSlug = cs === 'company' || cs === 'restaurant' || cs === 'default';
      if (!match && genericSlug) {
        match = companies[0];
      }
      if (!match) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }
      companyName = match.company_name || companyName;
    } else if (companies.length === 1) {
      companyName = companies[0].company_name || companyName;
    }

    res.json({
      tableId: table.id,
      tableName: table.name,
      tableCode: table.table_code,
      selfOrdering: table.self_ordering == null ? true : Boolean(Number(table.self_ordering)),
      qrEnabled: table.qr_enabled == null ? true : Boolean(Number(table.qr_enabled)),
      companyName,
    });
  } catch (e) {
    console.error('table-context:', e);
    res.status(500).json({ error: 'Failed to resolve table' });
  }
}

/** GET /api/public/health — verify public routes + DB */
router.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, service: 'qr-backend-public', db: true });
  } catch (e) {
    res.status(503).json({ ok: false, service: 'qr-backend-public', db: false, message: e.message });
  }
});

export default router;
