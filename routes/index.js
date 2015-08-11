var express = require('express');
var router = express.Router();

router.get( '/', function( req, res, next ) {
  res.render( 'index' );
});

router.get( '/:room', function( req, res, next ) {
  var roomId = req.params.room[0] == "@" ? 
               req.params.room : "@" + req.params.room;
  res.render( 'room', { room: roomId } );
});

module.exports = router;
