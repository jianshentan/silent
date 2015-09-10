var rc = require( './db/redis' );
var async = require( 'async' );
var curry = require( 'curry' );

var Room = function( roomId ) {
  this.roomId = roomId;

  this.objectify = function() {
    return {
      roomId: roomId
    };
  };
};

Room.prototype.occupants = function() {
  return curry( rc.roomUsers )( this.roomId );
};

Room.prototype.accTime = function() {
  return curry( rc.accRoomTime )( this.roomId );
};

Room.prototype.incrAccTime = function() {
  return curry( rc.incrRoomTime )( this.roomId );
};

module.exports = Room;
