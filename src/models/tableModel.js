import pool from '../../db.js';

const OPEN_ORDER_STATUSES = "('Pending', 'Preparing', 'Served')";

class TableModel {
  static async getAll() {
    const [rows] = await pool.query('SELECT * FROM tables ORDER BY id ASC');
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.query('SELECT * FROM tables WHERE id = ?', [id]);
    return rows[0] || null;
  }

  /** List tables with open-order totals (admin grid). */
  static async getAllEnriched() {
    const [tables] = await pool.query('SELECT * FROM tables ORDER BY id ASC');
    if (!tables.length) return [];

    const [agg] = await pool.query(
      `SELECT table_id AS tableId,
        COALESCE(SUM(total_amount), 0) AS openTotal,
        GROUP_CONCAT(id ORDER BY id) AS orderIds,
        MIN(created_at) AS sessionStart
      FROM orders
      WHERE table_id IS NOT NULL
        AND status IN ${OPEN_ORDER_STATUSES}
      GROUP BY table_id`
    );
    const byTable = new Map(agg.map((r) => [r.tableId, r]));

    return tables.map((t) => {
      const a = byTable.get(t.id);
      return { ...t, _agg: a || null };
    });
  }

  static async getByIdEnriched(id) {
    const row = await this.getById(id);
    if (!row) return null;
    const [orders] = await pool.query(
      `SELECT id, customer_name, total_amount, status, created_at
       FROM orders WHERE table_id = ? ORDER BY id DESC`,
      [id]
    );
    const openOrders = orders.filter((o) =>
      ['Pending', 'Preparing', 'Served'].includes(o.status)
    );
    const openTotal = openOrders.reduce((s, o) => s + Number(o.total_amount), 0);
    let sessionStart = null;
    if (openOrders.length > 0) {
      sessionStart = openOrders.reduce(
        (min, o) => {
          const d = new Date(o.created_at);
          return d < min ? d : min;
        },
        new Date(openOrders[0].created_at)
      );
    }
    return {
      ...row,
      orders,
      openOrders,
      openTotal,
      sessionStart,
    };
  }

  static async create(payload) {
    const {
      name,
      table_code = null,
      capacity = 4,
      branch_id = null,
      floor_section = null,
      qr_enabled = true,
      self_ordering = true,
      is_active = true,
      status = 'Available',
    } = payload;
    const [result] = await pool.query(
      `INSERT INTO tables (
        name, table_code, capacity, branch_id, floor_section,
        qr_enabled, self_ordering, is_active, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        table_code,
        capacity,
        branch_id,
        floor_section,
        qr_enabled ? 1 : 0,
        self_ordering ? 1 : 0,
        is_active ? 1 : 0,
        status,
      ]
    );
    return result.insertId;
  }

  static async update(id, data) {
    const row = await this.getById(id);
    if (!row) return 0;

    const name = data.name !== undefined ? data.name : row.name;
    const table_code = data.table_code !== undefined ? data.table_code : row.table_code;
    const capacity = data.capacity !== undefined ? data.capacity : row.capacity ?? 4;
    const branch_id =
      data.branch_id !== undefined ? data.branch_id : row.branch_id ?? null;
    const floor_section =
      data.floor_section !== undefined ? data.floor_section : row.floor_section ?? null;
    const qr_enabled =
      data.qr_enabled !== undefined ? (data.qr_enabled ? 1 : 0) : row.qr_enabled ?? 1;
    const self_ordering =
      data.self_ordering !== undefined
        ? data.self_ordering
          ? 1
          : 0
        : row.self_ordering ?? 1;
    const is_active =
      data.is_active !== undefined ? (data.is_active ? 1 : 0) : row.is_active ?? 1;
    const status = data.status !== undefined ? data.status : row.status;

    const [r] = await pool.query(
      `UPDATE tables SET
        name = ?, table_code = ?, capacity = ?, branch_id = ?, floor_section = ?,
        qr_enabled = ?, self_ordering = ?, is_active = ?, status = ?
      WHERE id = ?`,
      [
        name,
        table_code,
        capacity,
        branch_id,
        floor_section,
        qr_enabled,
        self_ordering,
        is_active,
        status,
        id,
      ]
    );
    return r.affectedRows;
  }

  static async setStatus(id, newStatus) {
    if (newStatus === 'Available' || newStatus === 'Reserved') {
      const [r] = await pool.query(
        'UPDATE tables SET status = ?, occupied_since = NULL WHERE id = ?',
        [newStatus, id]
      );
      return r.affectedRows;
    }
    if (newStatus === 'Occupied') {
      const [r] = await pool.query(
        `UPDATE tables SET status = ?, occupied_since = COALESCE(occupied_since, NOW()) WHERE id = ?`,
        [newStatus, id]
      );
      return r.affectedRows;
    }
    const [r2] = await pool.query('UPDATE tables SET status = ? WHERE id = ?', [newStatus, id]);
    return r2.affectedRows;
  }

  static async deleteById(id) {
    const [result] = await pool.query('DELETE FROM tables WHERE id = ?', [id]);
    return result.affectedRows;
  }

  static async getNextNumericCodeSuggestion() {
    const [rows] = await pool.query(
      `SELECT table_code FROM tables WHERE table_code REGEXP '^[0-9]+$'`
    );
    let max = 0;
    for (const r of rows) {
      const n = parseInt(r.table_code, 10);
      if (!Number.isNaN(n) && n > max) max = n;
    }
    return max + 1;
  }
}

export default TableModel;
