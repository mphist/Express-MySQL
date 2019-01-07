var express = require('express');
var router = express.Router();
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var template = require('../lib/template.js');
var connection = require('../lib/db');
var auth = require('../lib/auth');

var authData = {
  id: 'hooni88',
  password: 'test',
  nickname: 'hooni'
};

router.get('/login', (request, response) => {
  connection.query(`SELECT * FROM topic`, (error, topics, fields) => {
    if (error) {
      throw error;
    } else {
      connection.query(`SELECT * FROM author`, (error2, authors) => {
        if (error2) {
          throw error2;
        } else {
          request.list = topics;
          var title = 'login';       
          var list = template.list(request.list);
          var html = template.HTML(title, list, `
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

router.post('/login_process', (request, response) => {
  var id = request.body.id;
  var pw = request.body.pw;
  var nickname = authData.nickname;
  if (id === authData.id && pw === authData.password) {
    request.session.is_loggedin = true;
    request.session.nickname = nickname;
    //redirect to main page after session is saved
    request.session.save(() => {
      response.redirect('/');
    });
    
  } else {
    response.send('Who are you?');
  }
});

router.get('/logout', (request, response) => {
  request.session.destroy((err) => {
    response.redirect('/');
  });
});
  
module.exports = router;