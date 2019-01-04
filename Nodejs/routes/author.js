var express = require('express');
var router = express.Router();
var template = require('../lib/template');
var connection = require('../lib/db');

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
                    <input type="submit">
                </p>
            </form>
            `;
            var html = template.HTML(title, list, body, '');
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

module.exports = router;