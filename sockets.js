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

// tentative storage (should be replaced with redis)
var db = {};

exports.start = function( io ) {

  // active user count
  var visitorCount = 0;
  var userCount = 0;

  // client is connected - 'socket' refers to the client
  io.on( 'connection', function( socket ) { 
    var roomId, userId, guest;

    var socketIp = socket.request.connection.remoteAddress;
    var url = socket.request.headers.referer; // full url

    // client enters (hits the url as a guest)
    socket.on( 'enter', function( data ) {
      guest = true;
      visitorCount++;
      roomId = data.room_id;
      guestId = 'guest' + visitorCount; // tentative username for guests / guestId 
      userId = roomId+":"+guestId;

      // join room
      socket.join( roomId );

      user = {
        user_id: userId,
        username: guestId, 
        visitor_count: visitorCount,
        guest: guest,
        active: true
      };
      addUser( user, roomId, function() {

        // sending to all clients in <roomId> channel except sender
        socket.broadcast.to( roomId ).emit( 'visitor entered', 
          { guest: true, username: guestId } );

        // send to current request socket client
        socket.emit( 'entered', { 
            user: { 
              user_id: userId, 
              username: guestId, 
              visitor_count: visitorCount, 
              guest: guest, 
              active: true 
            }, 
            users: db[ roomId ]
        } );

      });
      
    });
    
    // client joins (as a user)
    socket.on( 'join', function( data ) {
      guest = false;
      userCount++;
    });

    // client closes connection
    socket.on( 'disconnect', function() {
    });

  });

};

function addUser( user, roomId, callback ) {
  if( !(roomId in db) ) {
    db[ roomId ] = [];
  }
  db[ roomId ].push( user );
  callback();
};