var rc = require( './db/redis' );
var async = require( 'async' );
var curry = require( 'curry' );
var maybe = require( './util/maybe' );

// keep private - instead use createRoom
var Room = function( roomId ) {
  this.id = roomId;
};

var getRoom = function( roomId ) {
  if (typeof roomId === 'string' || roomId instanceof String) {
    return new maybe.Just( new Room( roomId ) );
  } else {
    return maybe.Nothing;
  }
};

// cb
Room.prototype.occupants = curry( rc.roomUsers )( this.id );

// cb
Room.prototype.accTime = curry( rc.accRoomTime )( this.id );

// seconds, cb
Room.prototype.incrAccTime = curry( rc.incrRoomTime )( this.id );

// seconds, cb
Room.prototype.incrAccTime = curry( rc.incrRoomTime )( this.id );

Room.prototype.objectify = function() { return { roomId: this.id }; };

module.exports = {
  getRoom: getRoom
};
