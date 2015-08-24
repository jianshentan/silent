var jwt = require( 'jsonwebtoken' );

module.exports = function( app, passport ) {

  // jwt token validation middleware
  app.use( '/user', function( req, res, next ) {

    // check header or url parameters or post parameters for token
    var token = req.body.token || 
                req.query.token || 
                req.headers[ 'x-access-token' ];

    // if token is available
    if( token ) {
      console.log( "TOKEN AVAILABLE" );
      // verifies secret and checks exp
      jwt.verify( token, app.get( 'secret' ), function( err, decoded ) {      
        if( err ) {
          console.log( err ) ;
          return res.json({ 
            success: false, 
            message: 'Failed to authenticate token.' 
          });    
        } else {
          // if everything is good, save to request for use in other routes
          req.decoded = decoded;    
          next();
        }
      });
    } 

    // if token not found
    else {
      console.log( "TOKEN NOT AVAILABLE" );
      return res.status( 403 ).send({ 
          success: false, 
          message: 'No token provided.' 
      });
    }

  });

  app.post( '/login', 
    function( req, res, next ) {

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
            var token = jwt.sign( { username: user }, app.get( 'secret' ), {
              expiresInMinutes: 1440 * 30 // 1 month
            });

            return res.json( { token: token } );
          });
        }

      })( req, res, next );
  });

  app.post( '/signup', 
    function( req, res, next ) {

      /* param:user - user from 'local-signup' strategy
         param:info - msg from 'local-signup' strategy */
      passport.authenticate( 'local-signup', function( err, user, info ) {
        if( err ) { return next(err); }

        // signup failed
        if( !user ) {  
          return res.send( info );
        } 
        // signup success
        else { 
          req.logIn( user, function( err ) {
            if( err ) { return next( err ); }

            // create token to send to user
            var token = jwt.sign( { username: user }, "my-secret", {
              expiresInMinutes: 1440 * 30 // 1 month
            });

            return res.json( { token: token } );
          });
        }

      })( req, res, next );
  });

};
