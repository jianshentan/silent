var express = require( 'express' );
var router = express.Router();
var passport = require( 'passport');
var async = require( 'async' );
var authentication = require( '../authentication.js' );

router.get( '/', function( req, res, next ) {
  res.render( 'index' );
});

router.get( '/@:room', function( req, res, next ) {
  var roomId = req.params.room;
  res.render( 'room', { room: roomId } );
});

router.get( '/login', function( req, res, next ) {
  res.render( 'login' );
});

router.get( '/signup', function( req, res, next ) {
  res.render( 'signup' );
});

var LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy( authentication.authenticate ));

router.post('/login',
    passport.authenticate('local', { successRedirect: '/',
                                     failureRedirect: '/login',
                                     failureFlash: true })
);

router.post('/signup', function( req, res ) {
  var username = req.body.username;
  var password = req.body.password;
  // TODO: if username null or empty

  authentication.signup( username, password, function( err, userId ) {
    if( err ) {
      res.send( 'Username taken :(' ); // TODO: redirect to login page with username taken message
    } else {
      res.send( 'signed up!' );
    }
  });
});

module.exports = router;
