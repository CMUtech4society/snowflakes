var config = require('./config');
var baseUrl = config.baseUrl;
var title = config.title;

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var knex = require('knex');
var flash = require('connect-flash');

var session = require('express-session');
var KnexSessionStore = require('connect-session-knex')(session);
var db = knex(config.knexConfiguration);
var store = new KnexSessionStore({ createtable: true, knex: db });

var indexRouter = require('./routes/index');

var app = express();
app.locals.baseUrl = baseUrl;
app.locals.title = title;
app.locals.pretty = true;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(baseUrl + '/', express.static(path.join(__dirname, 'public')));
app.use(session({
  store: store,
  secret: config.cookieSecret,
  resave: false,
  saveUninitialized: true,
}));
app.use(flash());

app.use((req, res, next) => { req.db = db; next();});
app.use(baseUrl + '/', indexRouter);
app.get('/', (r, res) => res.redirect(baseUrl));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.back = req.header('referrer') || baseUrl;
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;