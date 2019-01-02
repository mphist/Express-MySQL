var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var template = require('../lib/template.js');
var mysql = require('mysql');
var connection = mysql.createConnection({
  host : 'localhost',
  user : 'nodejs',
  password : 'test',
  database : 'opentutorials'  
});

connection.connect();

router.get('/create', (request, response) => {
  connection.query(`SELECT * FROM topic`, (error, rows, fields) => {
    request.list = rows;
    var title = 'WEB - create';
    var list = template.list(request.list);
    var html = template.HTML(title, list, `
      <form action="/topic/create_process" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
          <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>
    `, '');
    response.writeHead(200);
    response.end(html);
    });
});

router.post('/create_process', (request, response) => {
  var post = request.body;
  var title = post.title;
  var description = post.description;
  connection.query(`INSERT INTO topic (title, description, created, author_id) VALUES (?,?,NOW(),?)`, [title, description, 1], (error, rows, fields) => {
    response.redirect(`/topic/${title}`);
  });
});

router.get('/update/:pageId', (request, response) => {
  var filteredId = path.parse(request.params.pageId).base;
  connection.query(`SELECT * FROM topic`, (error1, rows, fields) => {
    if (error1) {
      throw error1;
    } else {
      request.list = rows;
      connection.query(`SELECT * FROM topic WHERE title = "${filteredId}"`, (error2, result) => {
        if (error2) {
          throw error2;
        } else {
          request.result = result;
          var title = filteredId;
          var description = request.result[0].description;
          var list = template.list(request.list);
          var html = template.HTML(title, list,
            `
            <form action="/topic/update_process" method="post">
              <input type="hidden" name="id" value="${request.result[0].id}">
              <p><input type="text" name="title" placeholder="title" value="${title}"></p>
              <p>
                <textarea name="description" placeholder="description">${description}</textarea>
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
            `,
            `<a href="/create">create</a> <a href="/update/${title}">update</a>`
          );
          response.send(html);
        }
      });
    }
  });
});

router.post('/update_process', (request, response) => {
  var post = request.body;
  var id = post.id;
  var title = post.title;
  var description = post.description;
  connection.query(`UPDATE topic SET title = ?, description = ?, author_id = 1 WHERE id = ?`, [title, description, id], (error, rows, fields) => {
    if (error) {
      throw error;
    } else {
      response.redirect(`/topic/${title}`);
    }
  });
});

router.post('/delete_process', (request, response) => {
  var filteredId = path.parse(request.body.id).base;
  connection.query(`DELETE FROM topic WHERE id = ?`, [filteredId], (error, rows) => {
    if (error) {
      throw error;
    } else {
      response.redirect("/");
    }
  });
});

router.get('/:pageId', (request, response, next) => {
  var filteredId = path.parse(request.params.pageId).base;
  var title = filteredId;

  connection.query(`SELECT * FROM topic`, (error, rows, fields) => {
    if (error) {
      throw(error);
    } else {
        connection.query(`SELECT * FROM topic WHERE title = "${title}"`, (error2, results) => {
          if (error2) {
            throw error2;
          }
          else {
            request.list = rows;
            request.result = results;
           
            var description = request.result[0].description;
            var sanitizedTitle = sanitizeHtml(title);
            var sanitizedDescription = sanitizeHtml(description, {
              allowedTags:['h1']
            });
            var list = template.list(request.list);
            var html = template.HTML(sanitizedTitle, list,
              `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
              ` <a href="/topic/create">create</a>
                <a href="/topic/update/${sanitizedTitle}">update</a>
                <form action="/topic/delete_process" method="post">
                  <input type="hidden" name="id" value="${request.result[0].id}">
                  <input type="submit" value="delete">
                </form>`
            );
            response.writeHead(200);
            response.end(html);
          }
        });
      }
  });
});
  
module.exports = router;