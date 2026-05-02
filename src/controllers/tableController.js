import TableModel from '../models/tableModel.js';

function mapListRow(row) {
  const a = row._agg;
  const r = { ...row };
  delete r._agg;
  return {
    id: r.id,
    name: r.name,
    tableCode: r.table_code != null && r.table_code !== '' ? String(r.table_code) : null,
    capacity: r.capacity != null ? Number(r.capacity) : 4,
    status: r.status,
    branchId: r.branch_id != null ? Number(r.branch_id) : null,
    floorSection: r.floor_section || null,
    qrEnabled: r.qr_enabled == null ? true : Boolean(r.qr_enabled),
    selfOrdering: r.self_ordering == null ? true : Boolean(r.self_ordering),
    isActive: r.is_active == null ? true : Boolean(r.is_active),
    occupiedSince: r.occupied_since || null,
    currentOrderTotal: a ? Number(a.openTotal) : 0,
    activeOrderIds: a && a.orderIds ? a.orderIds.split(',').map((x) => Number(x)) : [],
    sessionStartedAt: a && a.sessionStart ? a.sessionStart : null,
  };
}

function mapDetailPayload(row) {
  if (!row) return null;
  const orders = (row.orders || []).map((o) => ({
    id: o.id,
    customerName: o.customer_name,
    total: Number(o.total_amount),
    status: o.status,
    createdAt: o.created_at,
  }));
  return {
    id: row.id,
    name: row.name,
    tableCode: row.table_code != null ? String(row.table_code) : null,
    capacity: row.capacity != null ? Number(row.capacity) : 4,
    status: row.status,
    branchId: row.branch_id != null ? Number(row.branch_id) : null,
    floorSection: row.floor_section || null,
    qrEnabled: row.qr_enabled == null ? true : Boolean(row.qr_enabled),
    selfOrdering: row.self_ordering == null ? true : Boolean(row.self_ordering),
    isActive: row.is_active == null ? true : Boolean(row.is_active),
    occupiedSince: row.occupied_since || null,
    openTotal: row.openTotal,
    sessionStart: row.sessionStart,
    orders,
  };
}

class TableController {
  static async nextCode(req, res) {
    try {
      const n = await TableModel.getNextNumericCodeSuggestion();
      res.json({ nextCode: n, suggestedLabel: `T-${n}` });
    } catch (error) {
      console.error('Error next table code:', error);
      res.status(500).json({ error: 'Failed to read table codes' });
    }
  }

  static async getTables(req, res) {
    try {
      const rows = await TableModel.getAllEnriched();
      res.json(rows.map(mapListRow));
    } catch (error) {
      console.error('Error fetching tables:', error);
      res.status(500).json({ error: 'Failed to fetch tables' });
    }
  }

  static async getTable(req, res) {
    try {
      const row = await TableModel.getByIdEnriched(req.params.id);
      if (!row) return res.status(404).json({ error: 'Table not found' });
      res.json(mapDetailPayload(row));
    } catch (error) {
      console.error('Error fetching table:', error);
      res.status(500).json({ error: 'Failed to fetch table' });
    }
  }

  static async addTable(req, res) {
    try {
      const body = req.body || {};
      let name = body.name;

      // Legacy Base64 payload
      if (body.data && !name) {
        try {
          const decodedBuffer = Buffer.from(body.data, 'base64');
          const parsedData = JSON.parse(decodedBuffer.toString('utf-8'));
          name = parsedData?.table_details?.name;
        } catch {
          /* ignore */
        }
      }

      if (!name || !String(name).trim()) {
        return res.status(400).json({ error: 'Table name is required' });
      }

      const payload = {
        name: String(name).trim(),
        table_code: body.table_code != null ? String(body.table_code).trim() || null : null,
        capacity: body.capacity != null ? parseInt(body.capacity, 10) || 4 : 4,
        branch_id: body.branch_id != null && body.branch_id !== '' ? Number(body.branch_id) : null,
        floor_section: body.floor_section != null ? String(body.floor_section).trim() || null : null,
        qr_enabled: body.qr_enabled !== undefined ? Boolean(body.qr_enabled) : true,
        self_ordering: body.self_ordering !== undefined ? Boolean(body.self_ordering) : true,
        is_active: body.is_active !== undefined ? Boolean(body.is_active) : true,
        status: ['Available', 'Occupied', 'Reserved'].includes(body.status) ? body.status : 'Available',
      };

      const insertId = await TableModel.create(payload);
      const rows = await TableModel.getAllEnriched();
      const created = rows.find((r) => r.id === insertId);
      res.status(201).json(mapListRow(created || { ...(await TableModel.getById(insertId)), _agg: null }));
    } catch (error) {
      console.error('Error adding table:', error);
      res.status(500).json({ error: 'Failed to add table' });
    }
  }

  static async updateTable(req, res) {
    try {
      const { id } = req.params;
      const body = req.body || {};
      const existing = await TableModel.getById(id);
      if (!existing) return res.status(404).json({ error: 'Table not found' });

      const data = {};
      if (body.name !== undefined) data.name = String(body.name).trim();
      if (body.table_code !== undefined) data.table_code = body.table_code ? String(body.table_code).trim() : null;
      if (body.capacity !== undefined) data.capacity = parseInt(body.capacity, 10) || 4;
      if (body.branch_id !== undefined) data.branch_id = body.branch_id === '' || body.branch_id == null ? null : Number(body.branch_id);
      if (body.floor_section !== undefined) data.floor_section = body.floor_section ? String(body.floor_section).trim() : null;
      if (body.qr_enabled !== undefined) data.qr_enabled = Boolean(body.qr_enabled);
      if (body.self_ordering !== undefined) data.self_ordering = Boolean(body.self_ordering);
      if (body.is_active !== undefined) data.is_active = Boolean(body.is_active);
      if (body.status !== undefined && ['Available', 'Occupied', 'Reserved'].includes(body.status)) {
        data.status = body.status;
      }

      await TableModel.update(id, data);
      const rows = await TableModel.getAllEnriched();
      const updated = rows.find((r) => String(r.id) === String(id));
      res.json(mapListRow(updated || { ...(await TableModel.getById(id)), _agg: null }));
    } catch (error) {
      console.error('Error updating table:', error);
      res.status(500).json({ error: 'Failed to update table' });
    }
  }

  static async patchStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body || {};
      if (!['Available', 'Occupied', 'Reserved'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      const affected = await TableModel.setStatus(id, status);
      if (!affected) return res.status(404).json({ error: 'Table not found' });
      const rows = await TableModel.getAllEnriched();
      const updated = rows.find((r) => String(r.id) === String(id));
      res.json(mapListRow(updated || { ...(await TableModel.getById(id)), _agg: null }));
    } catch (error) {
      console.error('Error patching table status:', error);
      res.status(500).json({ error: 'Failed to update status' });
    }
  }

  static async deleteTable(req, res) {
    try {
      const { id } = req.params;
      const affected = await TableModel.deleteById(id);
      if (affected === 0) {
        return res.status(404).json({ error: 'Table not found' });
      }
      res.json({ message: 'Table deleted successfully' });
    } catch (error) {
      console.error('Error deleting table:', error);
      res.status(500).json({ error: 'Failed to delete table' });
    }
  }
}

export default TableController;
