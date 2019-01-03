module.exports = {
  HTML:function(title, list, body, control){
    return `
    <!doctype html>
    <html>
    <head>
      <title>WEB1 - ${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h1><a href="/">WEB</a></h1>
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
      list = list + `<li><a href="/topic/${filelist[i].title}">${filelist[i].title}</a></li>`;
      i = i + 1;
    }
    list = list+'</ul>';
    return list;
  },
  authorSelect:function(authors, author_id=1) {
    var tag = '';
    var i = 0;
    console.log(author_id);
    while (i < authors.length) {
      var author = authors[i];
      var selected = '';
      if (author_id === author.id) {
        selected = ' selected';
      }
      tag += `<option value="${author.id}"${selected}>${author.name}</option>`;
      i++;
    }
    console.log(tag);
    return (
    `<select name="authors">${tag}</select>`
    );
  }
}
