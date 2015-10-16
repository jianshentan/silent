var rc = require( './db/redis' );
var async = require( 'async' );
var maybe = require( './util/maybe' );
var curry = require( 'curry' );

var User = function( userId, displayName ) {
  // these behave like a cache - may not have most updated info
  this.id = userId;
  this.displayName = displayName;
};

User.prototype.objectify = function() {
  return {
    userId: this.id,
    displayName: this.displayName
  };
};

/*
 * next::function( err, Maybe<User> )
 */
var getUser = function( userId, next ) {

  async.seq(
    // get the user data
    function( userId, cb ) {
      rc.getUser( userId, function( err, userData ) {
        cb( err, userId, userData.map( function( ud ) { 
          ud.userId = userId;
          return ud;
        }));
      });
    },

    // make user
    function( userId, userData, cb ) {
      cb( null, userData.map( function( ud ) { return new User( ud.userId, ud.displayName ); } ) );
    }

  )( userId, next );
};

var createInternalUser = function( username, passwordHash, salt, next ) {
  async.seq( 

    // create the user
    rc.createInternalUser,

    // set username
    function( userId, cb ) {
      rc.alterUser( userId, { displayName: username }, function( err ) {
        cb( err, userId );
      });
    },

    // get user from userid
    getUser

  )( username, passwordHash, salt, next );

};

var exists = function( provider, extId, cb ) {
  rc.getUserIdFromExtId( provider, extId, function( err, maybeUserId ) {
    cb( err, maybeUserId.isPresent() );
  });
};

module.exports = {
  exists: exists,
  getInternalUserId: rc.getInternalUserId, // fn( username, cb )
  getInternalUserPasswordData: rc.internalUserPasswordData, // fn( userId, cb )
  createInternalUser: createInternalUser,
  getUser: getUser
};

