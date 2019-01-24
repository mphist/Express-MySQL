var { Pool, Client } = require('pg');
var client = new Client({
  host : 'localhost',
  user : 'nodejs',
  password : 'test',
  database : 'opentutorials'  
});
  

client.connect();

module.exports = client;