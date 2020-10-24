
const mariadb = require('mariadb');

const db = mariadb.createPool({
  host: 'db',
  user: 'root',
  password: 'admin!',
  database: 'dnd',
  connectionLimit: 5,
});

module.exports = db;
