var mysql = require('mysql');
var connection = mysql.createConnection({
  host : 'localhost',
  user : 'nodejs',
  password : 'test',
  database : 'opentutorials'  
});

connection.connect();

module.exports = connection;