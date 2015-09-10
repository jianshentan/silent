var express = require( 'express' );
var router = express.Router();
var authentication = require( './src/authentication' );

module.exports = function( passport, jwtTokenizer ) {

  router.get( '/', function( req, res ) {
    res.render( 'index' );
  });

  router.get( '/home', function( req, res ) {
    res.render( 'home' );
  });

  router.get( '/@:room', function( req, res ) {
    var roomId = req.params.room;
    res.render( 'room', { room: roomId } );
  });

  /*
   * If login fails the callback doesn't happen and the response is a 401
   */
  router.post( '/login', passport.authenticate( 'local-login' ), function( req, res ) {
    res.json({ 
      token: jwtTokenizer.sign( req.user ),
      user: req.user.objectify()
    });
  });

  router.post( '/signup', function( req, res ) {
    authentication.signup( req.body.username, req.body.password, function( err, user ) {
      if( user ) {
        res.json({ 
          token: jwtTokenizer.sign( user ),
          user: user.objectify()
        });
      } else {
        res.status(422).send();
      }
    });
  });

  router.post( '/auth', passport.authenticate( 'bearer', { session: false } ), function( req, res ) {
    res.json( req.user );
  });

  router.get( '/login', function( req, res ) {
    res.render( 'login' );
  });

  router.get( '/signup', function( req, res ) {
    res.render( 'signup' );
  });

  router.get( '/trending', function( req, res ) {
    // currently fake data:
    res.json([
      { room: "room1", active: 5254 },
      { room: "room2", active: 1508 },
      { room: "room3", active: 987 },
      { room: "room4", active: 729 },
      { room: "room5", active: 221 },
      { room: "room6", active: 85 },
      { room: "room7", active: 7 },
      { room: "room8", active: 7 },
      { room: "room9", active: 7 },
      { room: "room10", active: 7 }
    ]);
  });

  return router;
};
