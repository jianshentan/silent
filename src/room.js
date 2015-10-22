var rc = require( './db/redis' );
var async = require( 'async' );
var curry = require( 'curry' );
var maybe = require( './util/maybe' );
var user = require( './user' );

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
  rc.addUserToRoom( this.id, userId, function( err, results ) {
    cb( err, results.every( function( r ) { return r == 1; } ) );
  });
};

Room.prototype.removeUser = function( userId, cb ) {
  rc.removeUserFromRoom( this.id, userId, cb );
};

Room.prototype.occupants = function( next ) {
  async.seq(
    rc.roomUsers,
    function( userIds, cb ) {
      async.map( userIds, function( userId, cb2 ) {
        user.getUser( userId, function( err, maybeUser ) {
          if( maybeUser.isPresent() ) {
            cb2( null, maybeUser.value );
          } else {
            cb2( 'User with id ' + userId + ' does not exist' );
          }
        });
      }, function( err, users ) {
        cb( null, users );
      });
    }
  )( this.id, next );
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
