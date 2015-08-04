/* SOCKET */

var socket = io();
socket.emit( 'enter', { room_id: '123' } );
