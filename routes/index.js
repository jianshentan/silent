var express = require( 'express' );
var router = express.Router();
var passport = require( 'passport');
var async = require( 'async' );
var rc = require( './db/redis.js' );

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
    async.seq(
      rc.userExists.curry( 'silent' ) /* fn( userId, cb ) */ ,
      function( exists, cb ) {
        if (!exists) {
          cb( true );
        } else {
          var userId = rc.getOrCreateInternalUser(username);
          cb( null, userId );
        }
      },
      function( userId ) {
        var passwordHash = rc.internalUserPassword( userId ); 

      }
    ),

    User.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

router.post('/login',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login',
                                   failureFlash: true })
);

module.exports = router;
