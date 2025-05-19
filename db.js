const mysql = require('mysql2/promise');
//import mysql from 'mysql2';


async function povezava(){
  return mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '!Praktikum1',
  database: 'Pohodniki'
});
}


module.exports = povezava;
//export default connection;
