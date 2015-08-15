/*
 * user-id-seq INT
 * 
 * user:[user_id] HASH<
 *   username STRING
 *   password STRING
 * >
 *
 * room-users:[room_id] SET<user_id>
 *
 * user-rooms:[user_id] SET<room_id>
 *
 * room-user-footprint:[room_id]:[user_id] HASH<
 *   acc-time INTEGER
 *   msg STRING
 * >
 *
 * acc-room-time:[room_id] INTEGER //TODO
 *
 */

var redis = require('redis');
var rc = redis.createClient();
var async = require('async');

/*
 * userId::int
 * cb::function( string, user )
 *
 * where
 * user::{
 *   username::string,
 *   password::string, -- pgp
 * }
 *
 */
exports.getUser = function( userId, cb ) {
  rc.hgetall( 'user:' + userId, cb );
};

/* 
 * username::string
 * passwordHash::string
 * cb::function( string, int )
 *
 */
exports.createUser = function( username, passwordHash, cb ) {
  rc.incr( 'user-id-seq', function( err, userId ) {
    rc.hmset( 'user:' + userId, {
      'username': username,
      'password': passwordHash
    }, function (err, _) {
      cb( null, userId );
    } );
  });
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
  multi.exec( function( err, replies ) {
    cb( err );
  } );
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
  multi.exec( function( err, replies ) {
    cb( err );
  } );
};

/*
 * userId::integer
 * cb::function( string, [int] )
 */
exports.userRooms = function( userId, cb ) {
  rc.smembers( 'user-rooms:' + userId, cb );
};

/*
 * roomId::string
 * cb::function( int, [string] )
 */
exports.roomUsers = function( roomId, cb ) {
  rc.smembers( 'room-users:' + roomId, cb );
};
