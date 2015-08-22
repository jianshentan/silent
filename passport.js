var LocalStrategy = require( 'passport-local' ).Strategy;
var authentication = require( './authentication' );

module.exports = function( passport ) {

  passport.use( 'local-login', new LocalStrategy( authentication.login ) );
  
  passport.use( 'local-signup', new LocalStrategy( authentication.signup ) );

};
