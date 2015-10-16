var async = require( 'async' );
var crypto = require( 'crypto' );
var jwt = require( 'jsonwebtoken' );
var user = require( './user' );

var generateHash = function( password, salt, cb ) {
  // Use the provided salt to regenerate the hash with the user provided password
  crypto.pbkdf2( password, salt, 1000, 512, 'sha512', function( err, derivedKey ) {
    cb( null, derivedKey );
  });
};

exports.jwtTokenizer = function( jwtSecret ) {
  var TOKEN_LIFE = 60 * 24 * 10; // 10 days
  var tokenizer = {};

  tokenizer.sign = function( user ) {
    return jwt.sign( user.objectify(), jwtSecret, {
      expiresInMinutes: TOKEN_LIFE
    });
  };

  tokenizer.verify = function( token, cb ) {
    jwt.verify( token, jwtSecret, cb ); 
  };

  return tokenizer;
}; 

exports.login = function( username, password, done ) {
  console.log( 'Authenticating with { username: ' + username + ', password: ' + password + ' }');

  async.seq(

    // check if user exists
    user.exists,

    // if exists, get user id, else done
    function( exists, cb ) {
      if( exists ) {
        user.getInternalUserId( username, cb );
      } else {
        cb( 'user does not exist' );
      }
    },

    // once we have user id, get and compare passwords
    function( maybeUserId, cb ) {
      user.getInternalUserPasswordData( maybeUserId.value, function( err, maybePasswordData ) {
        generateHash( password, maybePasswordData.value.salt, function( err, derivedKey ) {
          // If the hashes match then we're good
          if( maybePasswordData.value.passwordHash == derivedKey ) {
            cb( null, maybeUserId.value );
          } else {
            cb( 'password is invalid' );
          }
        });
      });
    },

    // and get the user
    function( userId, cb ) {
      user.getUser( userId, cb );
    }
  
  )( 'silent', username, function( err, maybeUser ) {
    if( err ) {
      done( null, false, { message: err } );
    } else {
      done( null, maybeUser.value );
    }
  });
};

/*
 * username::string
 * password::string
 * done::function( string, User ) // err, user
 */
exports.signup = function( username, password, done ) {
  async.seq(

      // check if user exists
      user.exists,

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
        user.createInternalUser( username, passwordHash, salt, cb );
      }

  )( 'silent', username, function( err, maybeUser ) { 
    if( err || !maybeUser.isPresent() ) {
      done( err, false, { message: err } );
    } else {
      done( null, maybeUser.value );
    }
  });
};


