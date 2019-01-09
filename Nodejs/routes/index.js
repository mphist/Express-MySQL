var express = require('express');
var router = express.Router();
var template = require('../lib/template');
var connection = require('../lib/db');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var auth = require('../lib/auth');
var flash = require('connect-flash');
var passport = require('passport')
, LocalStrategy = require('passport-local').Strategy;

router.use(flash());

// use session middleware
router.use(session({
    secret: 'rkskekfkakqktk!@#',
    resave: false,
    saveUninitialized: true,
    store: new FileStore()
  }));

var authData = {
    id: 'hooni88',
    password: 'test',
    nickname: 'hooni'
};

router.use(passport.initialize());
router.use(passport.session());

passport.serializeUser(function(user, done) {
    console.log('serailize ', user);
    done(null, user.id);
});
  
passport.deserializeUser(function(id, done) {
    console.log('deserialize ', id);
    done(null, authData);
});

passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'pw'
  },
    function(username, password, done) {
        console.log(username, password);
        if (username === authData.id) {
            if (password === authData.password) {
                return done(null, authData)
            } else {
                console.log('wrong password');
                return done(null, false, { message: 'Incorrect password.' });
            }
        } else {
            console.log('wrong id');
            return done(null, false, { message: 'Incorrect id.' });
        }
    }
));

router.post('/auth/login_process', (request, response, next) => {
    passport.authenticate('local', function(err, user, info) {
        console.log('session', request.session);
        if (err) { return next(err); }
        if (!user) {
            request.flash('error', info.message);
            console.log('1');
            request.session.save(() => {
                console.log('222')
                return response.redirect('/auth/login');
            });
            
        } else {
            request.logIn(user, function(err) {
                console.log('3')
                if (err) { return next(err); }
                request.session.save(() => {
                    return response.redirect('/');
                });
            });
        }
      })(request, response, next);
});

router.get('/', (request, response) => {
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