var fs = require('fs');
var bodyParser = require('body-parser');
const express = require('express');
const app = express();
var topicRouter = require('./routes/topic');
var indexRouter = require('./routes/index');

// middleware functions have access to the request and response objects.

// use the body-parser middleware
app.use(bodyParser.urlencoded({ extended: false}));

// use a custom middleware - for all app.get only
// this shows that all the app.get I previously wrote are actually using the custom middleware pertaining to that particular app.get
app.get('*', function(request, response, next) {
  fs.readdir('./data', function(error, filelist) {
    request.list = filelist;
    next();
  });
});

app.use(express.static('public'));

// use page routing
app.use('/', indexRouter);
app.use('/topic', topicRouter);

// because middlewares execute in order, error handling comes last
app.use(function(request, response, next){
  response.status(404).send("Sorry, the page cannot be found");
});

app.use(function(err, request, response, next) {
  console.log('wtf');
  response.status(500).send("Something broke!");
});

app.listen(3000);
