var express = require('express');
var router = express.Router();
var template = require('../lib/template');
var connection = require('../lib/db');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var auth = require('../lib/auth');

// use session middleware
router.use(session({
    secret: 'rkskekfkakqktk!@#',
    resave: false,
    saveUninitialized: true,
    store: new FileStore()
  }));

router.get('/', (request, response) => {
    /* if (request.session.num === undefined) {
        request.session.num = 1;
    } else {
        request.session.num += 1;
    }
    if (request.session.is_loggedin) {
        var authStatusUI = '<a href="/auth/logout">logout</a>';
    } */

    console.log(request.session);
    connection.query(`SELECT * FROM topic`, (error, rows, fields) => {
        request.list = rows;
        var title = 'Welcome';
        var description = 'Hello, Node.js';
        
        var list = template.list(request.list);
        var html = template.HTML(title, list,
            `
            <h2>${title}</h2>${description}
            <img src="/images/hello-sf.jpg" style="width:500px; display:block; margin-top: 10px;">
            `,
            `<a href="/topic/create">create</a>`,
            auth.StatusUI(request, response)
        );
        response.writeHead(200);
        response.end(html);
    });
});

module.exports = router;