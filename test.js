import pool from './db.js';
pool.query('SHOW COLUMNS FROM orders WHERE Field = "status"').then(([res]) => {
  console.log(res);
  process.exit();
}).catch(e => console.error(e));
