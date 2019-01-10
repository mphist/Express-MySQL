var express = require('express');
var router = express.Router();
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var template = require('../lib/template.js');
var connection = require('../lib/db');
var auth = require('../lib/auth');

router.get('/create', (request, response) => {
  connection.query(`SELECT * FROM topic`, (error, topics, fields) => {
    if (error) {
      throw error;
    } else {
      connection.query(`SELECT * FROM author`, (error2, authors) => {
        if (error2) {
          throw error2;
        } else {
          request.list = topics;
          var title = 'create';       
          var list = template.list(request.list);
          var body = '';
          if (request.session.passport) {
            body = `
            <form action="/topic/create_process" method="post">
              <p><input type="text" name="title" placeholder="title"></p>
              <p>
                <textarea name="description" placeholder="description"></textarea>
              </p>
              <p>
                ${template.authorSelect(authors)}
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
          `;
          } else {
            body = 'You must be logged in to create a topic';
          }
          var html = template.HTML(title, list, body, '', auth.StatusUI(request, response));
          response.writeHead(200);
          response.end(html);
        }
      });
    }
  });
});

router.post('/create_process', (request, response) => {
  var post = request.body;
  var title = sanitizeHtml(post.title);
  var description = sanitizeHtml(post.description);
  var author = sanitizeHtml(post.authors);
  var query = connection.query(`INSERT INTO topic (title, description, created, author_id) VALUES (?,?,NOW(),?)`, 
    [title, description, author], (error, rows, fields) => {
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
          connection. query(`SELECT * FROM author`, (error3, authors) => {
            if (error3) {
              throw error3;
            } else {
                request.result = result;
                var title = filteredId;
                var description = request.result[0].description;
                var list = template.list(request.list);
                var body = '';
                if (request.session.passport) {
                  body = `
                  <form action="/topic/update_process" method="post">
                    <input type="hidden" name="id" value="${request.result[0].id}">
                    <p><input type="text" name="title" placeholder="title" value="${sanitizeHtml(title)}"></p>
                    <p>
                      <textarea name="description" placeholder="description">${sanitizeHtml(description)}</textarea>
                    </p>
                    <p>
                      ${template.authorSelect(authors, sanitizeHtml(result[0].author_id))}
                    </p>
                    <p>
                      <input type="submit">
                    </p>
                  </form>
                  `;
                } else {
                  body = 'You must be logged in to update a topic';
                }
                var html = template.HTML(title, list, body,
                  `<div><a href="/topic/create">create</a> <a href="/topic/update/${title}">update</a></div>`,
                  auth.StatusUI(request, response)
                );
                response.send(html);
              }
          });
        }
      });
    }
  });
});

router.post('/update_process', (request, response) => {
  var post = request.body;
  var id = sanitizeHtml(post.id);
  var title = sanitizeHtml(post.title);
  var description = sanitizeHtml(post.description);
  var author = sanitizeHtml(post.authors);
  connection.query(`UPDATE topic SET title = ?, description = ?, author_id = ? WHERE id = ?`, [title, description, author, id], (error, rows, fields) => {
    if (error) {
      throw error;
    } else {
      response.redirect(`/topic/${title}`);
    }
  });
 
});

router.post('/delete_process', (request, response) => {
  if (request.session.passport) {
    var filteredId = path.parse(request.body.id).base;
    connection.query(`DELETE FROM topic WHERE id = ?`, [filteredId], (error, rows) => {
      if (error) {
        throw error;
      } else {
        response.redirect("/");
      }
    });
  } else {
    //response.redirect('/');
    response.send(`<script>
                    alert('You must be logged in to delete a topic');
                    location.href="/";
                   </script>`);
  }
});

router.get('/:pageId', (request, response, next) => {
  var filteredId = path.parse(request.params.pageId).base;
  var title = filteredId;
  connection.query(`SELECT * FROM topic`, (error, rows, fields) => {
    if (error) {
      throw(error);
    } else {
        // need to override the id in RowDataPacket by topic.id
        connection.query(`SELECT *, topic.id FROM topic LEFT JOIN author ON topic.author_id = author.id WHERE title = "${title}"`, (error2, results) => {
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
              `
              <h2>${sanitizedTitle}</h2>
              ${sanitizedDescription}
              <p>by ${request.result[0].name}</p>
              `,
              ` <a href="/topic/create">create</a>
                <a href="/topic/update/${sanitizedTitle}">update</a>
                <form action="/topic/delete_process" method="post">
                  <input type="hidden" name="id" value="${request.result[0].id}">
                  <input type="submit" value="delete">
                </form>`, auth.StatusUI(request, response)
            );
            response.writeHead(200);
            response.end(html);
          }
        });
      }
  });
});
  
module.exports = router;