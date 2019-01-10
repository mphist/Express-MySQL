var express = require('express');
var router = express.Router();
var template = require('../lib/template');
var path = require('path');
var connection = require('../lib/db');
var auth = require('../lib/auth');

router.get('/', (request, response) => {
    connection.query(`SELECT * FROM topic`, (error, topics) => {
        connection.query(`SELECT * FROM author`, (error2, authors) => {
            var title = 'author';
            var list = template.list(topics);
            var body = `
            <table>
                ${template.authorTable(authors)}
            </table>
            <style>
                table {
                    border-collapse: collapse;
                }
                td {
                    border: 1px solid black;
                }
            </style>
            <form action="/author/create_author_process" method="post">
                <p>
                    <input type="text" name="name" placeholder="name"></input>
                </p>
                <p>
                    <textarea name="profile" placeholder="profile"></textarea>
                </p>
                <p>
                    <input type="submit" value="create">
                </p>
            </form>
            `;
            var html = template.HTML(title, list, body, '', auth.StatusUI(request, response));
            response.send(html);
        });
    });
});

router.post('/create_author_process', (request, response) => {
    var name = request.body.name;
    var profile = request.body.profile;
    connection.query(`INSERT INTO author (name, profile) VALUES (?,?)`, 
        [name, profile], (error, author) => {
        if (error) {
            throw error;
        }
    });
    response.redirect(`/author`);
});

router.get(`/update/:pageId`, (request, response) => {
    var filteredId = path.parse(request.params.pageId).base;
    connection.query(`SELECT * from topic`, (error, topics) => {
        connection.query(`SELECT * from author`, (error2, authors) => {
            connection.query(`SELECT * from author WHERE name = ?`, [filteredId], (error3, author) => {
                var title = 'author';
                var list = template.list(topics);
                function updateOrNot() {
                    if (request.session.passport) {
                        return `
                        <p>
                            <input type="text" name="name" placeholder="name" value="${author[0].name}"></input>
                        </p>
                        <p>
                            <textarea name="profile" placeholder="profile">${author[0].profile}</textarea>
                        </p>
                        `
                    } else {
                        return `
                        <p>
                            <input type="text" name="name" placeholder="name"></input>
                        </p>
                        <p>
                            <textarea name="profile" placeholder="profile"></textarea>
                        </p>
                        <script>
                            alert('You must be logged in to update the author list');
                            location.href='/author';
                        </script>
                        `
                    }
                }
                var body = `
                    <table>
                        ${template.authorTable(authors)}
                    </table>
                    <style>
                        table {
                            border-collapse: collapse;
                        }
                        td {
                            border: 1px solid black;
                        }
                    </style>
                    <form action="/author/update_author_process" method="post">
                        <input type="hidden" name="id" value="${author[0].id}">
                        ${updateOrNot()}
                        <p>
                            <input type="submit" value="update">
                        </p>
                    </form>
                    `;
                var html = template.HTML(title, list, body, '', auth.StatusUI(request, response));
                response.send(html);
                });      
        });
    });
});

router.post('/update_author_process', (request, response) => {
    var name = request.body.name;
    var profile = request.body.profile;
    var id = request.body.id
    connection.query(`UPDATE author SET name = ?, profile = ? WHERE id = ?`, [name, profile, id], (error, author) => {
        response.redirect(`/author`);
    });
});

router.post('/delete_process', (request, response) => {
    if(request.session.passport) {
        var id = request.body.id;
        connection.query(`DELETE FROM author WHERE id = ?`, [id], (error, author) => {
            response.redirect('/author');
        });
    } else {
        response.send(`<script>
                        alert('You must be logged in to delete from the author list');
                        location.href='/author';
                       </script>
        `);
    }
    
})

module.exports = router;