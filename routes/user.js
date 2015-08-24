var express = require( 'express' );
var router = express.Router();

/* routes in this file pass through jwt token validation middle */

router.post( '/test', function( req, res ) {
  res.render( 'index' );
});

module.exports = router;
