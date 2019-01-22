var express = require('express');
var router = express.Router();
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var template = require('../lib/template.js');
var connection = require('../lib/db');
var flash = require('connect-flash');
var bcrypt = require('bcrypt');

module.exports = function(passport) {
  router.use(flash());
  router.get('/login', (request, response) => {
    connection.query(`SELECT * FROM topic`, (error1, topics, fields) => {
      if (error1) {
        throw error1;
      } else {
        connection.query(`SELECT * FROM author`, (error2, authors) => {
          if (error2) {
            throw error2;
          } else {
            request.list = topics;
            var title = 'login';       
            var list = template.list(request.list);
            var login_error = request.flash().error;
            var html = template.HTML(title, list, `
              <p>${login_error ? login_error : ''}</p>
              <form action="/auth/login_process" method="post">
                <p><input type="text" name="id" placeholder="id"></p>
                <p>
                  <input type="password" name="pw" placeholder="password">
                </p>
                <p>
                  <input type="submit" value="login">
                </p>
              </form>
            `, '');
            response.writeHead(200);
            response.end(html);
          }
        });
      }
    });
  });

  router.post('/login_process', (request, response, next) => {
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
                console.log('3', user)
                if (err) { return next(err); }
                request.session.save(() => {
                    return response.redirect('/');
                });
            });
        }
      })(request, response, next);
  });

  router.get('/logout', (request, response) => {
    request.logout();
    request.session.destroy((err) => {
      response.redirect('/');
    });
  });

  router.get('/register', (request, response) => {
    connection.query(`SELECT * FROM topic`, (error1, topics, fields) => {
      if (error1) {
        throw error1;
      } else {
        connection.query(`SELECT * FROM author`, (error2, authors) => {
          if (error2) {
            throw error2;
          } else {
            request.list = topics;
            var title = 'register';       
            var list = template.list(request.list);
            var error_id = request.flash('error_id');
            var error_pw = request.flash('error_pw');
            console.log('-----------', error_id, error_pw);
            var html = template.HTML(title, list, `
              <p>${error_id ? error_id : ''}</p>
              <form action="/auth/register_process" method="post">
                <p><input type="text" name="id" placeholder="enter id"></p>
                <p>
                  <input type="password" name="pw" placeholder="enter password">
                </p>
                <p>${error_pw ? error_pw : ''}</p>
                <p>
                  <input type="password" name="pw2" placeholder="re-enter password">
                </p>
                <p>
                  <input type="text" name="displayName" placeholder="enter a display name">
                </p>
                <p>
                  <input type="submit" value="register">
                </p>
              </form>
            `, '');
            response.writeHead(200);
            response.end(html);
          }
        });
      }
    });
  });

  router.post('/register_process', (request, response) => {
    if (request.body.pw === request.body.pw2) {
      bcrypt.hash(request.body.pw, 10, function(err, hash) {
        // Store hash in your password DB.
        var user = JSON.stringify({"id": request.body.id,
                  "password": hash,
                  "nickname": request.body.displayName
        });
        connection.query(`SELECT * from authData WHERE JSON_EXTRACT(jdoc, '$.id') = ?`, request.body.id, (err, rows) => {
          if (!rows.length) {
            connection.query(`INSERT INTO authData VALUES ('{"id": "${request.body.id}", "password": "${hash}", 
                                                                  "nickname": "${request.body.displayName}"}')`, (err, results) => {
              request.login(user, (err) => {
                console.log('register process user', user)
                request.session.save(() => {
                  response.redirect('/');
                });
              });
            });
          } else {
            request.flash('error_id', 'User id already exists.');
            request.session.save(() => {
              response.redirect('/auth/register');
            });
          } 
        }); 
      });
    } else {
      request.flash('error_pw', "Passwords don't match.");
      request.session.save(() => {
        response.redirect('/auth/register');
      });
    }
  });
  
  return router;
}