var express = require( 'express' );
var router = express.Router();
var authentication = require( './src/authentication' );

module.exports = function( passport, jwtTokenizer ) {

  router.get( '/', function( req, res ) {
    res.render( 'index' );
  });
  router.get( '/m_', function( req, res ) {
    res.render( 'm_index' );
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
  router.get( '/m_login', function( req, res ) {
    res.render( 'm_login' );
  });

  router.get( '/signup', function( req, res ) {
    res.render( 'signup' );
  });
  router.get( '/m_signup', function( req, res ) {
    res.render( 'm_signup' );
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

  /* Search Bar */
  router.get( '/search/:query', function( req, res ) {
    var query = req.query.query;
    res.json([
      { name: "roomExample1", active: 123 },
      { name: "roomExample2", active: 321 },
      { name: "roomExample3", active: 432 },
      { name: "roomExample4", active: 543 },
      { name: "roomExample5", active: 654 },
      { name: "roomExample6", active: 123 },
      { name: "roomExample7", active: 123 },
      { name: "roomExample8", active: 123 },
      { name: "roomExample9", active: 123 },
      { name: "roomExample10", active: 123 },
      { name: "roomExample11", active: 123 },
    ]);
  });

  return router;
};
