var sanitizeHtml = require('sanitize-html');

module.exports = {
  HTML:function(title, list, body, control, authStatusUI='<a href="/auth/login">login</a> | <a href="/auth/register">register</a>'){
    return `
    <!doctype html>
    <html>
    <head>
      <link rel="stylesheet" type="text/css" href="../search.css">
      <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.2/css/all.css" integrity="sha384-fnmOCqbTlWIlj8LyTjo7mOUStjsKC4pOpQbqyi7RrhN7udi9RwhKkMHpvLbHG9Sr" crossorigin="anonymous">
      ${authStatusUI}
      <title>WEB1 - ${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h1><a href="/">WEB</a></h1>
      <div class="search">
        <form action="/search" method="get">
          <input type="text" name="q" placeholder="search...">
          <button type="submit"><i class="fa fa-search"></i></button>
        </form>
      </div>
      <p>
        <a href="/author">author</a>
      </p>
      ${list}
      ${control}
      ${body}
    </body>
    </html>
    `;
  },
  list:function(filelist){
    var list = '<ul>';
    var i = 0;
    while(i < filelist.length){
      list = list + `<li><a href="/topic/${sanitizeHtml(filelist[i].title)}">${sanitizeHtml(filelist[i].title)}</a></li>`;
      i = i + 1;
    }
    list = list+'</ul>';
    return list;
  },
  authorSelect:function(authors, author_id=1) {
    var tag = '';
    var i = 0;
    while (i < authors.length) {
      var author = authors[i];
      var selected = '';
      if (author_id == author.id) {
        selected = ' selected';
      }
      tag += `<option value="${author.id}"${selected}>${author.name}</option>`;
      i++;
    }
    return (
    `<select name="authors">${tag}</select>`
    );
  },
  authorTable:function(authors) {
    var tag = '';
    var i = 0;
    while (i < authors.length) {
      tag += `
      <tr>
        <td>${sanitizeHtml(authors[i].name)}</td>
        <td>${sanitizeHtml(authors[i].profile)}</td>
        <td><a href="/author/update/${authors[i].name}" name="update">update</a></td>
        <td>
          <form action="/author/delete_process" method="post">
            <input type="hidden" name="id" value="${authors[i].id}">
            <input type="submit" name="delete" value="delete">
          </form>
          <style>
            input[name="delete"] {
              background-color: #4CAF50;
              border: none;
              color: red;
              padding: 3px 4px;
              text-decoration: none;
              margin: 4px 2px;
              cursor: pointer;
            }
            a[name="update"] {
              background-color: #4CAF50;
              border: none;
              color: white;
              padding: 2px 2px;
              text-decoration: none;
              margin: 4px 2px;
              cursor: pointer;
            }
          </style>
        </td>
      </tr>
      `
      i++;
    }
    return tag;
  }
}
