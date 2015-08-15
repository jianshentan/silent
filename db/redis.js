/*
 * user-id-seq INT
 * room-id-seq INT
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
 * int -> {
 *   username: string,
 *   password: string, -- pgp
 * }
 *
 */
exports.getUser = function( userId ) {
  rc.hgetall( userId, function( user ) {
    return user;
  } );
};

/* 
 * string -> string -> int
 */
exports.createUser = function( username, passwordHash ) {
  rc.incr( 'user-id-seq', function( id ) {
    rc.hmset( {
      'username': username,
      'password': passwordHash
    } );
    
    return id;
  });
};
