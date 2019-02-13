var express = require('express');
var router = express.Router();
var template = require('../lib/template');
var connection = require('../lib/db');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var auth = require('../lib/auth');

module.exports = function(passport) {
    // use session middleware
    router.use(session({
        secret: 'rkskekfkakqktk!@#',
        resave: false,
        saveUninitialized: true,
        store: new FileStore()
    }));
    router.use(passport.initialize());
    router.use(passport.session());

    router.get('/', (request, response) => {
        console.log('im at main page');
        console.log(request.session);
        connection.query(`SELECT * FROM topic`, (error, res, fields) => {
            console.log('postgresql ', res.rows);
            request.list = res.rows;
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
    return router;
}
