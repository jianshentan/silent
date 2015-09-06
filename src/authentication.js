var rc = require( './db/redis' );
var async = require( 'async' );
var crypto = require( 'crypto' );

function generateHash( password, salt, cb ) {
  // Use the provided salt to regenerate the hash with the user provided password
  crypto.pbkdf2( password, salt, 1000, 512, 'sha512', function( err, derivedKey ) {
    cb( null, derivedKey );
  });
}

exports.login = function ( username, password, done ) {
  console.log( 'Authenticating with { username: ' + username + ', password: ' + password + ' }');
  async.seq(

    // check if user exists
    rc.userExists,

    // if exists, get user id, else done
    function( exists, cb ) {
      if( exists ) {
        rc.getInternalUserId( username, cb );
      } else {
        cb( 'user does not exist' );
      }
    },

    // once we have user id, get and compare passwords
    function( userId, cb ) {
      rc.internalUserPasswordData( userId, function( err, passwordData ) {
        generateHash( password, passwordData.salt, function( err, derivedKey ) {
          // If the hashes match then we're good
          if( passwordData.passwordHash == derivedKey ) {
            cb( null, userId );
          } else {
            cb( 'password is invalid' );
          }
        });
      });
    }

  )( 'silent', username, function( err, userId ) {
    if( err ) {
      done( null, false, { message: err } );
    } else {
      done( null, userId );
    }
  });
};

/*
 * username::string
 * password::string
 * done::function( string, int ) // err, userId
 */
exports.signup = function( username, password, done ) {
  async.seq(

      // check if user exists
      rc.userExists,

      // if it does then we callback with an error, else generate passwordHash
      function( exists, cb ) {
        if( exists ) {
          cb( 'username_taken', false );
        } else {
          var salt = crypto.randomBytes(128).toString('base64');
          generateHash( password, salt, function( err, passwordHash ) {
            cb( null, passwordHash, salt );
          });
        }
      },

      // and use it to create a user
      function( passwordHash, salt, cb ) {
        rc.createInternalUser( username, passwordHash, salt, cb );
      }

  )( 'silent', username, function( err, userId ) {
    if( err ) {
      done( null, false, { message: err } );
    } else {
      done( null, userId );
    }
  });
};


