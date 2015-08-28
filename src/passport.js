var LocalStrategy = require( 'passport-local' ).Strategy;
var authentication = require( './authentication' );

module.exports = function( passport ) {

  passport.use( 'local-login', new LocalStrategy( {

    // OPTIONS (currently is default)
    usernameField: "username", //specify where to get username
    passwordField: "password", //specify where to get username
    passReqToCallback: false // pass req object to callback

  }, authentication.login ) );
  
  passport.use( 'local-signup', new LocalStrategy( {

    // OPTIONS (currently is default)
    usernameField: "username", //specify where to get username
    passwordField: "password", //specify where to get username
    passReqToCallback: false // pass req object to callback

  }, authentication.signup ) );

};
