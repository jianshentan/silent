var rc = require( './db/redis' );
var async = require( 'async' );

module.exports = User = function( userId, displayName ) {

  this.getId = function() { return userId; }; 

  this.objectify = function() {
    return {
      userId: userId,
      displayName: displayName
    };
  };
};

module.exports.exists = function( provider, extId, cb ) {
  rc.userExists( provider, extId, cb );
};

module.exports.getUserId = function( username, cb ) {
  rc.getInternalUserId( username, cb );
};

module.exports.getPasswordData = function( userId, cb ) {
  rc.internalUserPasswordData( userId, cb );
};

module.exports.createInternalUser = function( username, passwordHash, salt, next ) {

  async.seq( 

    // create the user
    rc.createInternalUser,

    // set username
    function( userId, cb ) {
      console.log( userId );
      rc.alterUser( userId, { displayName: username }, function( err ) {
        cb( err, userId );
      });
    },

    // get user from userid
    this.getUserFromUserId

  )( username, passwordHash, salt, next );

};

module.exports.getUserFromUserId = function( userId, next ) {

  async.seq(

    // get the user data
    function( userId, cb ) {
      rc.getUser( userId, function( err, userData ) {
        cb( err, userId, userData );
      });
    },

    // make user
    function( userId, userData, cb ) {
      cb( null, new User( userId, userData.displayName ) );
    }

  )( userId, next );

};

