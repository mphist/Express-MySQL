var express = require('express');
var router = express.Router();
var template = require('../lib/template');
var path = require('path');
var connection = require('../lib/db');
var auth = require('../lib/auth');

router.get('/', (request, response) => {
    var title = 'search';
    var keyword = request.query.q;
    // lower() allows for case insensitive comparisons
    connection.query(`SELECT * FROM topic WHERE lower(title) like lower('%${keyword}%') or lower(description) like lower('%${keyword}%')`, 
        (err, topics) => {
            request.list = topics.rows;  
            var list = template.list(request.list);
            var body = `Search results for: ${request.query.q}`
            var html = template.HTML(title, list, body, "");    
            response.send(html);      
    });
});

module.exports = router;