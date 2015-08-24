/* routes in this file pass through jwt token validation middle */

var express = require( 'express' );
var router = express.Router();
var jwt = require( 'jsonwebtoken' );

// jwt token validation middleware
router.use( function( req, res, next ) {

  // check header or url parameters or post parameters for token
  var token = req.body.token || 
              req.query.token || 
              req.headers[ 'x-access-token' ];

  // if token is available
  if( token ) {
    // verifies secret and checks exp
    jwt.verify( token, req.app.get( 'secret' ), function( err, decoded ) {      
      if( err ) {
        console.log( "TOKEN ERROR: " + err ) ;
        return res.status( 401 ).json({ 
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
    return res.status( 403 ).send({ 
        success: false, 
        message: 'No token provided.' 
    });
  }

});

router.post( '/test', function( req, res ) {
  res.render( 'index' );
});

module.exports = router;
