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

exports.start = function( io ) {

  // client is connected - 'socket' refers to the client
  io.on( 'connection', function( socket ) { 

    var maybeConnRoom = maybe.Nothing;
    var maybeConnUser = maybe.Nothing;

    socket.on( 'enter', function( data ) {
      maybeConnRoom = room.getRoom( data.roomId );
      user.getUser( data.userId, function( err, maybeUser ) {
        maybeConnUser = maybeUser;

        if( maybeConnRoom.isPresent() && maybeUser.isPresent() ) {
          var connRoom = maybeConnRoom.value;
          var connUser = maybeConnUser.value;

          console.log( "userId '" + connUser.id + "' entered '" + connRoom.id + "'" );

          // join room
          socket.join( connRoom.id );

          connRoom.addUser( connUser.id, function() {

            // sending to all clients in <roomId> channel except sender
            socket.broadcast.to( connRoom.id ).emit( 'visitor entered', { user: user.objectify() } );

            connRoom.occupants( function(err, occupantIds) {
              // send to current request socket client
              socket.emit( 'entered', { user: user,
                users: occupantIds.map( function(x) { return parseInt(x); })
              });
            });
          });
        } else {
          console.log( "Invalid roomId (" + data.roomId + ") or userId (" + data.userId + ")" );
        }
      });
    });
    
    // client joins (as a user) TODO
    socket.on( 'join', function( data ) {
    });

    // client closes connection
    socket.on( 'disconnect', function() {
      if( maybeConnRoom.isPresent() && maybeConnUser.isPresent() ) {
        var userId = maybeConnUser.value.id;
        var roomId = maybeConnRoom.value.id;
        console.log( "userId '" + userId + "' disconnected from '" + roomId + "'" );
        socket.broadcast.to( roomId ).emit( 'visitor left', { userId: userId } );
      }
    });
  });
};

