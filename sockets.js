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

exports.start = function( io ) {

  // active user count
  var visitorCount = 0;
  var userCount = 0;

  // client is connected - 'socket' refers to the client
  io.on( 'connection', function( socket ) { 

    var socketIp = socket.request.connection.remoteAddress;
    var url = socket.request.headers.referer; // full url
    var guest; 

    // client enters (hits the url as a guest)
    socket.on( 'enter', function( data ) {
      guest = true;
      visitorCount++;
      socket.join( data.room_id );
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

