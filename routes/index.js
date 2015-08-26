var express = require( 'express' );
var router = express.Router();

router.get( '/', function( req, res, next ) {
  res.render( 'index' );
});

router.get( '/home', function( req, res, next ) {
  res.render( 'home' );
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

module.exports = router;
