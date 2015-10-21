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

Room.prototype.addUser = function( userId, cb ) {
  rc.addUserToRoom( this.id, userId, cb );
};

Room.prototype.removeUser = function( userId, cb ) {
  rc.removeUserFromRoom( this.id, userId, cb );
};

Room.prototype.occupants = function( cb ) {
  rc.roomUsers( this.id, cb );
};

Room.prototype.addGuest = function( cb ) {
  rc.incrNumGuests( this.id, cb );
};

Room.prototype.removeGuest = function( cb ) {
  rc.decrNumGuests( this.id, cb );
};

Room.prototype.numGuests = function( cb ) {
  rc.getNumGuests( this.id, cb );
};

Room.prototype.accTime = function( cb ) {
  rc.accRoomTime( this.id, cb );
};

Room.prototype.incrAccTime = function( seconds, cb ) {
  rc.incrRoomTime( this.id, seconds, cb );
};

Room.prototype.objectify = function() { return { roomId: this.id }; };

module.exports = {
  getRoom: getRoom
};
