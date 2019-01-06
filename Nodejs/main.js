var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var topicRouter = require('./routes/topic');
var indexRouter = require('./routes/index');
var authorRouter = require('./routes/author');
var authRouter = require('./routes/auth');
var helmet = require('helmet');

// Use the Helmet middleware for security - displaying raw html?
//app.use(helmet());

// middleware functions have access to the request and response objects.

// use the body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));

// serve static files in Express
app.use(express.static('public'));

// use page routing
app.use('/', indexRouter);
app.use('/topic', topicRouter);
app.use('/author', authorRouter);
app.use('/auth', authRouter);

// because middlewares execute in order, error handling comes last
app.use(function(request, response, next){
  response.status(404).send("Sorry, the page cannot be found");
});

/* app.use(function(err, request, response, next) {
  console.log('wtf');
  response.status(500).send("Something broke!");
}); */

app.listen(3000);
