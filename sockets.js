/* ===========================================================
SOCKET Protocol

client --> server
-------------------------------------------------------------
  'join': [TODO]...
  'disconnect': [TODO]...

server --> client
-------------------------------------------------------------


for example socket.io code, visit: 
https://github.com/socketio/socket.io/blob/master/examples/chat/index.js

=========================================================== */

exports.start = function( io ) {

  io.on( 'connection', function( socket ) { 

    socket.on( 'disconnect', function( socket ) {

    });

  });

};

