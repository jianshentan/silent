var express = require( 'express' );
var router = express.Router();
var passport = require( 'passport');
var async = require( 'async' );
var authentication = require( '../authentication' );

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

router.get( '/signup', function( req, res, next ) {
  res.render( 'signup' );
});

module.exports = router;
