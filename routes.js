var express = require( 'express' );
var router = express.Router();
var authentication = require( './src/authentication' );

module.exports = function( passport ) {

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

  var jwt = require( 'jsonwebtoken' );
  router.post( '/login', function( req, res, next ) {
    /* param:user - user from 'local-login' strategy
       param:info - msg from 'local-login' strategy */
    passport.authenticate( 'local-login', function( err, user, info ) {
      if( err ) { return next(err); }

      // login failed
      if( !user ) { 
        return res.send( info );
      } 
      // login success
      else {
        req.logIn( user, function( err ) {
          if( err ) { return next( err ); }

          // create token to send to user
          // TODO decide what the package is
          var package = { user: user };
          var token = jwt.sign( package, req.app.get( 'secret' ), {
            expiresInMinutes: 1440 * 30 // 1 month
          });

          return res.json({ 
            success: true,
            message: "",
            token: token 
          });
        });
      }

    })( req, res, next );
  }
  );

  router.post('/signup', function( req, res ) {
    authentication.signup( req.body.username, req.body.password, function( err, userId ) {
      res.json({
        'userId': userId
      });
    });
  });

  router.get( '/login', function( req, res ) {
    res.render( 'login' );
  });

  router.get( '/signup', function( req, res ) {
    res.render( 'signup' );
  });

  return router;
};
