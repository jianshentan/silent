module.exports = function( app, passport ) {

  app.post( '/login', 
    passport.authenticate( 'local-login', { failureRedirect: '/login/fail' } ),
    function( req, res ) {
      console.log( "login" );
      res.send( "SUCCESSFUL LOGIN" );
    });

  app.get( '/login/fail', function( req, res ) {
    console.log( "login fail" );
    res.send( "FAIL LOGIN" );
  });

  app.post( '/signup',
    passport.authenticate( 'local-signup', { failureRedirect: '/signup/fail' } ),
    function( req, res ) {
      console.log( "signup" );
      res.send( "SUCCESSFUL SIGNUP" );
    });

  app.get( '/signup/fail', function( req, res ) {
    console.log( "signup fail" );
    res.send( "FAIL SIGNUP" );
  });

};
