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

/* tentative db methods (TODO should be replaced with redis) */
var db = {};

function addUser( user, roomId, callback ) {
  if( !(roomId in db) ) {
    db[ roomId ] = [];
  }
  db[ roomId ].push( user );
  callback();
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

    var roomId, userId, guest;

    var socketId = socket.id; // unique socket id for every time a socket is opened

    // TODO verify that this is working
    var socketIp = socket.request.connection.remoteAddress;

    var url = socket.request.headers.referer; // full url

    // client enters (hits the url as a guest)
    socket.on( 'enter', function( data ) {
      guest = true;
      visitorCount++;
      roomId = data.room_id;
      guestId = 'guest' + visitorCount; // tentative username for guests / guestId 
      userId = roomId+":"+guestId;

      console.log( "userId '" + userId+ "' entered '" + roomId + "'" );

      // join room
      socket.join( roomId );

      var user = new User( userId, guestId, visitorCount, guest, true );

      addUser( user, roomId, function() {

        // sending to all clients in <roomId> channel except sender
        socket.broadcast.to( roomId ).emit( 'visitor entered', 
          { user: user } );

        // send to current request socket client
        socket.emit( 'entered',  
          { user: user, users: db[ roomId ] });

      });
      
    });
    
    // client joins (as a user) TODO
    socket.on( 'join', function( data ) {
      guest = false;
      userCount++;
    });

    // client closes connection
    socket.on( 'disconnect', function() {

      console.log( "userId '" + userId + "' disconnected from '" + roomId + "'" );

      setInactive( userId, roomId, function() {
        socket.broadcast.to( roomId ).emit( 'visitor left',
          { userId: userId } ); 
      });

    });

  });

};

