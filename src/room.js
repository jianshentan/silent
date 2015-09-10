var rc = require( './db/redis' );
var async = require( 'async' );

var Room = function( id ) {
  var roomId = id;

  this.objectify = function() {
    return {
      roomId: roomId
    };
  };

  this.occupants = function( cb ) {
    rc.roomUsers( roomId, cb );
  };

  this.accumulatedTime = function( cb ) {
    rc.accRoomTime( roomId, cb );
  };

};

module.exports = Room;
