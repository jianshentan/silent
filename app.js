/* ================================================= 
   Require packages --------------------------------
   ================================================= */

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var user = require('./routes/user');
var passport = require('passport');
var config = require('./config'); // get our config file
var app = express();

/* ================================================= 
   View engine setup -------------------------------
   ================================================= */

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/* ================================================= 
   Configure App -----------------------------------
   ================================================= */

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());
  
// TODO: 
passport.serializeUser(function(userId, done) {
  done(null, userId);
});

// TODO
passport.deserializeUser(function(userId, done) {
  done(null, userId);
});

// configure Passport
require( './passport' )( passport) ;

// set application secret
app.set( 'secret', config.secret ); 

/* ================================================= 
   Routes ------------------------------------------
   ================================================= */

// load authentication routes
// pass in our app and fully configured passport
require( './routes/auth' )( app, passport );

app.use( '/', routes ); // does not require token auth
app.use( '/user', user ); // requires token auth

/* ================================================= 
   Error Management --------------------------------
   ================================================= */

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
