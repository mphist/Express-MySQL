var { Pool, Client } = require('pg');
/* var client = new Client({
  host : 'localhost',
  user : 'nodejs',
  password : '',
  database : 'opentutorials'  
}); */

var client = new Client({
  connectionString: process.env.DATABASE_URL
});
  

client.connect();

module.exports = client;