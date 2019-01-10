var express = require('express');
var router = express.Router();
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var template = require('../lib/template.js');
var connection = require('../lib/db');
var flash = require('connect-flash');

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
                console.log('3')
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

  return router;
}