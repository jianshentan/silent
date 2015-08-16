var express = require( 'express' );
var router = express.Router();
var passport = require( 'passport');
var async = require( 'async' );
var rc = require( '../db/redis.js' );
var crypto = require( 'crypto' );

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

var LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
  function(username, password, done) {
    async.waterfall( [
        rc.userExists.curry( 'silent' ) /* fn( userId, cb ) */ ,
        function( exists, cb ) {
          if (exists) {
            var userId = rc.getOrCreateInternalUser(username);
            cb( null, userId );
          } else {
            cb( true );
          }
        },
        function( userId, cb ) {
          rc.internalUserPassword( userId, function( err, passwordHash ) {
            crypto.pbkdf2( password, salt, 10000, 512, 'sha512', function( err, derivedKey ) {
              if( passwordHash == derivedKey ) {
                cb( null, userId );
              } else {
                cb( true );
              }
            });
          });
        }
    ], function( err, result ) {
       if( err ) {
         done( null, false );
       } else {
         done( null, userId );
       }
    });
}));

router.post('/login',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login',
                                   failureFlash: true })
);

module.exports = router;
