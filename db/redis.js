/*
 * user-id-seq INT
 * 
 * // data associated with user
 * user:[user_id] -> user HASH<
 *   'displayName' : STRING
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
 * // room a user is in
 * user-rooms:[user_id] -> room_ids SET<INT>
 *
 * // footprint of user in a room
 * room-user-footprint:[room_id]:[user_id] -> footprint HASH<
 *   'accTime' : INTEGER // accumulated time
 *   'msg' : STRING
 * >
 *
 * acc-room-time:[room_id] -> time INTEGER //TODO
 *
 */

var redis = require('redis');
var rc = redis.createClient();
var async = require('async');

/*
 * logs and propagates error
 */
var cbThrow = function( cb ) {
  return function( err ) {
    if( err ) {
      console.error( err );
      cb( err );
    } else {
      cb.apply(this, arguments);
    }
  };
};

/*
 * provider::string
 * extId::string
 * cb::function( string, int )
 */
exports.getUserIdFromExtId = function( provider, extId, cb ) {
  rc.get( 'user-id:ext-id:' + provider + ':' + extId, cbThrow( cb ) );
};

/*
 * userId::int
 * cb::function( string, user )
 */
exports.getUser = function( userId, cb ) {
  rc.hgetall( 'user:' + userId, cbThrow( cb ) );
};

/*
 * provider::string
 * extId::string
 * cb::function( string, boolean )
 */
exports.userExists = function( provider, extId, cb ) {
  rc.exists( 'user-id:ext-id:' + provider + ':' + extId, cbThrow( cb ) );
};

/*
 * userId::int
 * cb::function( string, passwordData )
 *
 * where
 * passwordData::{
 *   'passwordHash' : str
 *   'salt' : str
 * }
 *
 */
exports.internalUserPasswordData = function( userId, cb ) {
  rc.hgetall( 'user-password:' + userId, cbThrow( cb ) );
};

/* 
 * username::string
 * passwordHash::string
 * salt::string
 * cb::function( string, int )
 *
 */
exports.getOrCreateInternalUser = function( username, passwordHash, salt, cb ) {
  var rkey = 'user-id:ext-id:silent:' + username;
  rc.get( rkey, cbThrow( function( err, userId ) {
    if( userId ) {
      cb( null, userId );
    } else {
      rc.incr( 'user-id-seq', cbThrow( function( err, userId ) {
        var multi = rc.multi();
        multi.set( rkey, userId );
        multi.hmset( 'user-password:' + userId, {
          'passwordHash': passwordHash,
          'salt': salt,
        });
        multi.exec( cbThrow( function ( err, _ ) {
          cb( null, userId );
        } ) );
      } ) );
    }
  } ) );
};

/*
 * provider::string
 * extId::string
 * cb::function( string, int )
 */
exports.getOrCreateExternalUser = function( provider, extId, cb ) {
  if ( provider == 'silent' ) {
    cb( 'Provider may not be silent' );
  } else {
    var rkey = 'user-id:ext-id:' + provider + ':' + extId;
    rc.get( rkey, cbThrow( function( err, userId ) {
      if ( userId ) {
        cb( null, userId );
      } else {
        rc.incr( 'user-id-seq', cbThrow( function( err, userId ) {
          rc.set( rkey, userId, cbThrow( function( err, _ ) {
            cb( null, userId );
          } ) );
        } ) );
      }
    } ) );
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
exports.addUserToRoom = function( userId, roomId, cb ) {
  var multi = rc.multi();
  multi.sadd( 'room-users:' + roomId, userId );
  multi.sadd( 'user-rooms:' + userId, roomId);
  multi.exec( cbThrow( function( err ) {
    cb( err );
  } ) );
};

/*
 * userId::integer
 * roomId::string
 * cb::function( string )
 */
exports.removeUserFromRoom = function( userId, roomId, cb ) {
  var multi = rc.multi();
  multi.srem( 'room-users:' + roomId, userId );
  multi.srem( 'user-rooms:' + userId, roomId );
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
 * cb::function( int, [string] )
 */
exports.roomUsers = function( roomId, cb ) {
  rc.smembers( 'room-users:' + roomId, cbThrow( cb ) );
};
