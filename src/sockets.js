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

var async = require( 'async' );
var user = require( './user' );
var room = require( './room' );
var maybe = require( './util/maybe' );
var socketioJwt = require( 'socketio-jwt' );
var config = require( '../config/config' );
var jwt = require( 'jsonwebtoken' );
var moment = require( 'moment' );

exports.start = function( io ) {

  // client is connected - 'socket' refers to the client
  io.on( 'connection', function( socket ) { 

    var maybeConnRoom = maybe.Nothing;
    var maybeConnUser = maybe.Nothing;
    var joinTime = moment();
    
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

        async.parallel({
          // for some reason they have to be wrapped in functions for async to work
          occupants: function( cb ) { connRoom.occupants( cb ); },
          numGuests: function( cb ) { connRoom.numGuests( cb ); },
          ghosts: function( cb ) { connRoom.ghosts( cb ); }
        }, function( err, results ) {
          console.log( 'RESULTS: ' + JSON.stringify(results) );
          var occupants = results.occupants;
          var numGuests = results.numGuests;
          var ghosts = results.ghosts;

          if( maybeConnUser.isPresent() ) {
            var connUser = maybeConnUser.value;
            console.log( "userId '" + connUser.id + "' entered '" + connRoom.id + "'" );

            connRoom.addUser( connUser.id, function( err, added /* new user or not (bool) */ ) {

              if( err ) {
                console.error( err );
              } else {
                var otherUsers = occupants.filter( function( occupant ) {
                  return occupant.id != connUser.id;
                });

                var otherGhosts = ghosts.filter( function( ghost ) {
                  return ghost.id != connUser.id;
                });

                socket.emit( 'entered', {
                  user: connUser,
                  numGuests: numGuests,
                  users: otherUsers,
                  ghosts: otherGhosts
                });

                if( added ) {
                  // only if user isn't already active do we broadcast (multiple tabs)
                  socket.to( connRoom.id ).emit( 'visitor entered', {
                    user: connUser.objectify()
                  });
                }
              }
            });
          } else {
            connRoom.addGuest( function( err, numGuests ) {
              if( err ) {
                console.error( err );
              } else {
                connRoom.occupants( function( err, occupants ) {
                  socket.emit( 'entered', {
                    numGuests: numGuests,
                    users: occupants,
                    ghosts: ghosts
                  });
                });

                socket.to( connRoom.id ).emit( 'guest entered', { numGuests: numGuests } );
              }
            });
          }
        });
      } else {
        console.log( "Invalid roomId (" + data.roomId + ")");
      }
    });
  });
};

