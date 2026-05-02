import pool from '../../db.js';

const SELECT_NO_PASSWORD = `
  id, name, phone, email, role, branch, qualification, address, image, status,
  employeeId, gender, dateOfBirth, alternatePhone, department, shiftTiming, joiningDate,
  username, isPublish, permissionsJson, documentsJson
`;

const SELECT_WITH_PASSWORD = SELECT_NO_PASSWORD.replace(
  'email, role',
  'email, password, role'
);

function mapRow(row) {
  if (!row) return null;
  const pub = row.isPublish !== undefined && row.isPublish !== null ? Boolean(Number(row.isPublish)) : true;
  return {
    id: row.id,
    name: row.name,
    phone: row.phone || '',
    email: row.email || '',
    role: row.role || '',
    branch: row.branch || '',
    qualification: row.qualification || '',
    address: row.address || '',
    image: row.image || `https://i.pravatar.cc/150?u=${row.id}`,
    status: Boolean(row.status),
    employeeId: row.employeeId || '',
    gender: row.gender || '',
    dateOfBirth: row.dateOfBirth ? String(row.dateOfBirth).slice(0, 10) : '',
    alternatePhone: row.alternatePhone || '',
    department: row.department || '',
    shiftTiming: row.shiftTiming || '',
    joiningDate: row.joiningDate ? String(row.joiningDate).slice(0, 10) : '',
    username: row.username || '',
    isPublish: pub,
    permissionsJson: row.permissionsJson || null,
    documentsJson: row.documentsJson || null,
  };
}

function omitPassword(row) {
  if (!row) return null;
  const { password: _p, ...rest } = row;
  return rest;
}

class StaffModel {
  static async getAll() {
    const [rows] = await pool.query(`SELECT ${SELECT_NO_PASSWORD} FROM staff ORDER BY id DESC`);
    return rows.map(mapRow);
  }

  static async getById(id) {
    const [rows] = await pool.query(`SELECT ${SELECT_WITH_PASSWORD} FROM staff WHERE id = ?`, [id]);
    return omitPassword(mapRow(rows[0]));
  }

  static async create(payload) {
    const {
      name,
      phone,
      email,
      password,
      role,
      branch,
      qualification,
      address,
      image,
      status,
      employeeId,
      gender,
      dateOfBirth,
      alternatePhone,
      department,
      shiftTiming,
      joiningDate,
      username,
      isPublish,
      permissionsJson,
      documentsJson,
    } = payload;

    const [result] = await pool.query(
      `INSERT INTO staff (
        name, phone, email, password, role, branch, qualification, address, image, status,
        employeeId, gender, dateOfBirth, alternatePhone, department, shiftTiming, joiningDate,
        username, isPublish, permissionsJson, documentsJson
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        name,
        phone || null,
        email || null,
        password || null,
        role || null,
        branch || null,
        qualification || null,
        address || null,
        image || null,
        status ? 1 : 0,
        employeeId || null,
        gender || null,
        dateOfBirth || null,
        alternatePhone || null,
        department || null,
        shiftTiming || null,
        joiningDate || null,
        username || null,
        isPublish === false ? 0 : 1,
        permissionsJson || null,
        documentsJson || null,
      ]
    );
    const insertId = result.insertId;
    if (!payload.employeeId && insertId) {
      const autoId = `EMP-${String(insertId).padStart(5, '0')}`;
      await pool.query('UPDATE staff SET employeeId = ? WHERE id = ? AND (employeeId IS NULL OR employeeId = "")', [
        autoId,
        insertId,
      ]);
    }
    return insertId;
  }

  static async update(id, payload) {
    const {
      name,
      phone,
      email,
      password,
      role,
      branch,
      qualification,
      address,
      image,
      status,
      employeeId,
      gender,
      dateOfBirth,
      alternatePhone,
      department,
      shiftTiming,
      joiningDate,
      username,
      isPublish,
      permissionsJson,
      documentsJson,
    } = payload;

    const existing = await this.getById(id);
    if (!existing) return 0;

    const fields = [
      'name = ?',
      'phone = ?',
      'email = ?',
      'role = ?',
      'branch = ?',
      'qualification = ?',
      'address = ?',
      'image = ?',
      'status = ?',
      'employeeId = ?',
      'gender = ?',
      'dateOfBirth = ?',
      'alternatePhone = ?',
      'department = ?',
      'shiftTiming = ?',
      'joiningDate = ?',
      'username = ?',
      'isPublish = ?',
      'permissionsJson = ?',
      'documentsJson = ?',
    ];
    const values = [
      name,
      phone || null,
      email || null,
      role || null,
      branch || null,
      qualification || null,
      address || null,
      image !== undefined ? image : existing.image,
      status ? 1 : 0,
      employeeId !== undefined ? employeeId : existing.employeeId,
      gender !== undefined ? gender : existing.gender,
      dateOfBirth !== undefined ? dateOfBirth || null : existing.dateOfBirth || null,
      alternatePhone !== undefined ? alternatePhone : existing.alternatePhone,
      department !== undefined ? department : existing.department,
      shiftTiming !== undefined ? shiftTiming : existing.shiftTiming,
      joiningDate !== undefined ? joiningDate || null : existing.joiningDate || null,
      username !== undefined ? username : existing.username,
      isPublish !== undefined ? (isPublish === false ? 0 : 1) : existing.isPublish ? 1 : 0,
      permissionsJson !== undefined ? permissionsJson : existing.permissionsJson,
      documentsJson !== undefined ? documentsJson : existing.documentsJson,
    ];

    let sql = `UPDATE staff SET ${fields.join(', ')}`;
    if (password && String(password).trim()) {
      sql += ', password = ?';
      values.push(String(password));
    }
    sql += ' WHERE id = ?';
    values.push(id);

    const [result] = await pool.query(sql, values);
    return result.affectedRows;
  }

  static async updatePassword(id, plainPassword) {
    const [result] = await pool.query('UPDATE staff SET password = ? WHERE id = ?', [
      String(plainPassword),
      id,
    ]);
    return result.affectedRows;
  }

  static async deleteById(id) {
    const [result] = await pool.query('DELETE FROM staff WHERE id = ?', [id]);
    return result.affectedRows;
  }
}

export default StaffModel;
