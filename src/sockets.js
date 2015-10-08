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

var user = require('./user');
var room = require('./room');

/* tentative user model (TODO should be exported ) */
function User( userId, username, visitorCount, guest, active ) {
  this.userId = userId;
  this.username = username;
  this.visitorCount = visitorCount;
  this.guest = guest;
  this.active = active;

  this.enterTimes = [];
  this.exitTimes = [];
  this.enterTimes.push( Date.now() );
}

function setInactive( userId, roomId, callback ) {
  for( var i in db[ roomId ] ) {
    if( db[ roomId ][i].userId == userId ) {
      db[ roomId ][i].active = false;
      db[ roomId ][i].exitTimes.push( Date.now() );
    }
  }
  callback();
}

exports.start = function( io ) {

  // active user count
  var visitorCount = 0;
  var userCount = 0;

  // client is connected - 'socket' refers to the client
  io.on( 'connection', function( socket ) { 

    var room, user;

    // client enters (hits the url as a guest)
    socket.on( 'enter', function( data ) {
      maybeRoom = room.getRoom( data.roomId );
      maybeUser = User.getUser( data.userId );

      if( maybeRoom.isPresent() && maybeUser.isPresent() ) {
        var room = maybeRoom.value;
        var user = maybeUser.value;

        console.log( "userId '" + user.id + "' entered '" + room.id + "'" );

        // join room
        socket.join( room.id );

        addUser( user, room, function() {

          // sending to all clients in <roomId> channel except sender
          socket.broadcast.to( room.id ).emit( 'visitor entered', { user: user.objectify() } );

          room.occupants( function(err, occupantIds) {
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
    
    // client joins (as a user) TODO
    socket.on( 'join', function( data ) {
      guest = false;
      userCount++;
    });

    // client closes connection
    socket.on( 'disconnect', function() {
      if( room && user ) {
        console.log( "userId '" + user.id + "' disconnected from '" + room.id + "'" );

        setInactive( userId, roomId, function() {
          socket.broadcast.to( roomId ).emit( 'visitor left',
              { userId: userId } ); 
        });
      }
    });
  });
};

