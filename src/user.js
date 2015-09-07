var rc = require( './db/redis' );

module.exports = function( id ) {

  var userId = id;
  var username = null;

  this.getId = function() { return userId; }; 
  this.setId = function( id ) { userId = id; }; 

  this.getUsername = function() { return username; }; 
  this.setUsername = function( name ) { username = name; }; 

  this.client = function() {
    return {
      username: username
    }
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

module.exports.createUser = function( username, passwordHash, salt, cb ) {
  rc.createInternalUser( username, passwordHash, salt, cb );
};
