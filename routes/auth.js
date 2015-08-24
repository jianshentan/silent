var jwt = require( 'jsonwebtoken' );

module.exports = function( app, passport ) {

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
            // TODO decide what the package is
            var package = { user: user };
            var token = jwt.sign( package, app.get( 'secret' ), {
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
            // TODO decide what the package is
            var package = { user: user };
            var token = jwt.sign( package, "my-secret", {
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
  });

};
