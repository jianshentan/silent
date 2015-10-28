/*
 * user-id-seq INT
 * 
 * // data associated with user
 * user:[user_id] -> user HASH<
 *   'displayName' : STRING,
 *   'message': STRING
 * >
 *
 * // for users signing on without external provider
 * user-password:[user_id] -> HASH<
 *   passwordHash STRING,
 *   salt STRING
 * >
 *
 * // mapping of provider and external id to our internal user id
 * user-id:ext-id:[provider]:[ext_id] -> user_id INT
 *
 * // users in a room
 * room-users:[room_id] -> user_ids SET<INT>
 *
 * // users that have been in a room
 * room-footprints:[room_id] -> user_ids SET<INT>
 *
 * // room a user is in
 * user-rooms:[user_id] -> room_ids SET<INT>
 *
 * // footprint of user in a room
 * room-user-data:[room_id]:[user_id] -> footprint HASH<
 *   'accTime' : INTEGER // accumulated time
 *   'msg' : STRING
 * >
 *
 * room-acc-time:[room_id] -> time INTEGER //TODO
 *
 * room-num-guests:[room_id] -> INTEGER
 *
 */

var config = require( '../../config/config' );
var rc = config.redisClient();
var async = require( 'async' );
var maybe = require( '../util/maybe' );

var SILENT = 'silent';

/*
 * logs and propagates error and makes results maybe
 */
var cbThrow = function( cb ) {
  return function( err ) {
    if( err ) {
      console.error( err );
      cb( err ); // TODO: pass arguments here too
    } else {
      cb.apply( this, arguments );
    }
  };
};

var convertNullsToMaybes = function( cb ) {
  return function() {
    var args = [].slice.call(arguments, 1) // remove the err and convert arguments to array
                 .map( function( x ) { return maybe.ofNullable( x ); } );
    args.unshift( null ); // put back the null err
    cb.apply( this, args );
  };
};

/*
 * This function needs to be called on redis methods before they can be used in async
 */
exports.wrapRedisCommand = function( functionName ) {
  return function() {
    var lastIdx = arguments.length - 1;
    var nonCbArgs = [];
    for( var k in arguments ) {
      if (k != lastIdx) {
        nonCbArgs[k] = arguments[k];
      }
    }

    rc.send_command(functionName, nonCbArgs, arguments[lastIdx]);
  };
};

/*
 * provider::string
 * extId::string
 * cb::function( string, Maybe<int> )
 */
exports.getUserIdFromExtId = function( provider, extId, cb ) {
  rc.get( 'user-id:ext-id:' + provider + ':' + extId, convertNullsToMaybes( cbThrow( cb ) ) );
};

/*
 * userId::int
 * cb::function( string, Maybe<user> )
 */
exports.getUser = function( userId, cb ) {
  rc.hgetall( 'user:' + userId, convertNullsToMaybes( cbThrow( cb ) ) );
};

/*
 * userId::int
 * cb::function( string, maybe<passwordData> )
 *
 * where
 * passwordData::{
 *   'passwordHash' : str
 *   'salt' : str
 * }
 *
 */
exports.internalUserPasswordData = function( userId, cb ) {
  rc.hgetall( 'user-password:' + userId, convertNullsToMaybes( cbThrow( cb ) ) );
};

/*
 * provider::string,
 * extId::string
 * cb::function( string, int )
 */
var createUser = function( provider, extId, done ) {
  var rkey = 'user-id:ext-id:' + provider + ':' + extId;
  async.seq(
      wrapRedisCommand( 'get' ),
      function( userId, cb ) {
        if( userId ) {
          cb( 'user exists', userId );
        } else {
          rc.incr( 'user-id-seq', cb );
        }
      },
      function( userId, cb ) {
        rc.set( rkey, userId, function() {
          cb(null, userId);
        });
      }
  )( rkey, cbThrow( done ) );
};

/*
 * username::string,
 * passwordHash::string,
 * salt::string,
 * done::function( string, int )
 */
exports.createInternalUser = function( username, passwordHash, salt, done ) {
  async.seq(
      createUser,
      function( userId, cb ) {
        rc.hmset( 'user-password:' + userId, {
          'passwordHash': passwordHash,
          'salt': salt,
        }, function( err ) {
          cb( err, userId );
        });
      }
  )( SILENT, username, cbThrow( done ) );
};

/*
 * provider::string
 * extId::string
 * cb::function( string, int )
 */
exports.createExternalUser = function( provider, extId, done ) {
  if ( provider == SILENT ) {
    cb( 'Provider may not be ' + SILENT );
  } else {
    createUser( provider, extId, done );
  }
};

var getUserId = function( provider, extId, done ) {
  var rkey = 'user-id:ext-id:' + provider + ':' + extId;
  rc.get( rkey, convertNullsToMaybes( done ) );
};

/*
 * provider::string
 * extId::string
 * done::function( string, int )
 */
exports.getInternalUserId = function( username, done ) {
  getUserId( SILENT, username, cbThrow( done ) );
};

/*
 * provider::string
 * extId::string
 * done::function( string, int )
 */
exports.getExternalUserId = function( provider, extId, done ) {
  if ( provider == SILENT ) {
    cb( 'Provider may not be ' + SILENT );
  } else {
    getUserId( provider, extId, cbThrow( done ) );
  }
};

/*
 * userId::string
 * properties::{}
 * cb::function( string )
 */
exports.alterUser = function( userId, properties, cb ) {
  rc.hmset( 'user:' + userId, properties, cbThrow( function( err ) {
    cb( err );
  } ) );
};

/*
 * userId::integer
 * roomId::string
 * cb::function( string )
 */
exports.addUserToRoom = function( roomId, userId, cb ) {
  var multi = rc.multi();
  multi.sadd( 'room-users:' + roomId, userId );
  multi.sadd( 'room-footprints:' + roomId, userId );
  multi.sadd( 'user-rooms:' + userId, roomId);
  multi.zincrby( 'rooms-active-users', -1, roomId);
  multi.exec( cbThrow( function( err, results ) {
    cb( err, results );
  }));
};

/*
 * userId::integer
 * roomId::string
 * cb::function( string )
 */
exports.removeUserFromRoom = function( roomId, userId, cb ) {
  var multi = rc.multi();
  multi.srem( 'room-users:' + roomId, userId );
  multi.srem( 'user-rooms:' + userId, roomId );
  multi.zincrby( 'rooms-active-users', -1, roomId );
  multi.exec( cbThrow( function( err ) {
    cb( err );
  } ) );
};

/*
 * userId::integer
 * cb::function( string, [int] )
 */
exports.userRooms = function( userId, cb ) {
  rc.smembers( 'user-rooms:' + userId, cbThrow( cb ) );
};

/*
 * roomId::string
 * cb::function( string, [string] )
 */
exports.roomUsers = function( roomId, cb ) {
  rc.smembers( 'room-users:' + roomId, cbThrow( cb ) );
};

/*
 * roomId::string
 * cb::function( string, [string] )
 *
 * Both active and non active users will have a footprint
 */
exports.roomFootprints = function( roomId, cb ) {
  rc.smembers( 'room-footprints:' + roomId, cbThrow( cb ) );
};

/*
 * roomId::string
 * cb::function( string, [string] )
 *
 * Ghost is a non active user with a footprint in the room
 */
exports.roomGhosts = function( roomId, cb ) {
  rc.sdiff( 'room-footprints:' + roomId, 'room-users:' + roomId, cbThrow( cb ) );
};

/*
 * roomId::string
 * cb::function( int, int )
 */
exports.accRoomTime = function( roomId, cb ) {
  rc.smembers( 'room-acc-time:' + roomId, cbThrow( cb ) );
};

/*
 * This operation is atomic
 */
exports.incrRoomTime = function( roomId, seconds, cb ) {
  rc.incrby( 'room-acc-time:' + roomId, seconds, cbThrow( cb ) );
};

/*
 * This operation increments the number of guests in a room
 */
exports.incrNumGuests = function( roomId, cb ) {
  rc.incr( 'room-num-guests:' + roomId, cbThrow( cb ) );
};

/*
 * This operation decrements the number of guests in a room
 */
exports.decrNumGuests = function( roomId, cb ) {
  rc.decr( 'room-num-guests:' + roomId, cbThrow( cb ) );
};

/*
 * This operation gets the number of guests in a room
 */
exports.getNumGuests = function( roomId, cb ) {
  rc.get( 'room-num-guests:' + roomId, cbThrow( cb ) );
};

/*
 * Match rooms with given prefix
 * cb( err, [ { room: STRING,
 *              activeUsers: INTEGER } ] )
 *
 */
exports.roomWithActiveUsers = function( prefix, next ) {
  // NOTES: zscan will only return a portion of total matches.
  //        We assume that the number returned is sufficient for our use case.
  rc.zscan('rooms-active-users', 0, 'MATCH', prefix + '*', function( err, results ) {
    var roomsActiveUsers = results[1];
    var processedRoomsActiveUsers = [];

    for( var i = 0; i < roomsActiveUsers.length; i += 2 ) {
      processedRoomsActiveUsers.push({
        room: roomsActiveUsers[ i ],
        activeUsers: -roomsActiveUsers[ i + 1 ]
      });
    }

    next( null, processedRoomsActiveUsers );
  });
};

