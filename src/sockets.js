/* ===========================================================
SOCKET Protocol

client --> server
-------------------------------------------------------------
  'enter': { room_id: <room_id> }
  'join': [TODO]...
  'disconnect': [TODO]...

server --> client
-------------------------------------------------------------

for example socket.io code, visit: 
https://github.com/socketio/socket.io/blob/master/examples/chat/index.js

=========================================================== */

var user = require( './user' );
var room = require( './room' );
var maybe = require( './util/maybe' );
var socketioJwt = require( 'socketio-jwt' );
var config = require( '../config/config' );
var jwt = require( 'jsonwebtoken' );

exports.start = function( io ) {

  // client is connected - 'socket' refers to the client
  io.on( 'connection', function( socket ) { 

    var maybeConnRoom = maybe.Nothing;
    var maybeConnUser = maybe.Nothing;
    
    // client joins (as a user) TODO
    socket.on( 'join', function( data ) {
      jwt.verify( data.token, config.secret, function( err, token ) {
        if( err ) {
          console.log( 'INVALID TOKEN' );
          // TODO: Handle failure
        } else {
          console.log( 'Joined: ' + JSON.stringify(token) );
          user.getUser( token.userId, function( err, maybeUser ) {
            maybeConnUser = maybeUser;
          });
        }
      });
    });

    socket.on( 'guest', function() {
    });

    // client closes connection
    socket.on( 'disconnect', function() {
      if( maybeConnRoom.isPresent() ) {
        var connRoom = maybeConnRoom.value;

        if( maybeConnUser.isPresent() ) {
          var userId = maybeConnUser.value.id;
          connRoom.removeUser( userId, function( err ) {
            console.log( "userId '" + userId + "' disconnected from '" + connRoom.id + "'" );
            socket.to( connRoom.id ).emit( 'visitor left', { userId: userId } );
          });
        } else {
          console.log( "DISCONNECTING GUEST '" + connRoom.id + "'" );
          connRoom.removeGuest( function( err, numGuests ) {
            console.log( "Guest disconnected from '" + connRoom.id + "'" );
            socket.to( connRoom.id ).emit( 'guest left', { numGuests: numGuests } );
          });
        }
      }
    });


    socket.on( 'enter', function( data ) {
      maybeConnRoom = room.getRoom( data.roomId );
      if( maybeConnRoom.isPresent() ) {
        var connRoom = maybeConnRoom.value;

        // join room
        socket.join( connRoom.id );

        if( maybeConnUser.isPresent() ) {
          var connUser = maybeConnUser.value;
          console.log( "userId '" + connUser.id + "' entered '" + connRoom.id + "'" );

          connRoom.addUser( connUser.id, function( err ) {

            if( err ) {
              console.error( err );
            }


            connRoom.occupants( function( err, occupantIds ) {
              connRoom.numGuests( function( err, numGuests ) {
                socket.emit( 'entered', {
                  user: connUser,
                  numGuests: numGuests,
                  users: occupantIds.map( function(x) { return parseInt(x); })
                });
              });
            });

            // sending to all clients in <roomId> channel except sender
            socket.to( connRoom.id ).emit( 'visitor entered', {
              user: connUser.objectify()
            });

          });
        } else {
          connRoom.addGuest( function( err, numGuests ) {
            if( err ) {
              console.error( err );
            } else {
              connRoom.occupants( function( err, occupantIds ) {
                socket.emit( 'entered', {
                  numGuests: numGuests,
                  users: occupantIds.map( function( x ) { return parseInt( x ); })
                });
              });

              socket.to( connRoom.id ).emit( 'guest entered', { numGuests: numGuests } );
            }
          });
        }
      } else {
        console.log( "Invalid roomId (" + data.roomId + ") or userId (" + data.userId + ")" );
      }
    });
  });
};

