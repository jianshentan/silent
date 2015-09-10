(function() {

  var app = angular.module( 'Silent', [ 
    'HomeControllers',
    'RoomControllers',
    'UtilServices',
    'UserServices',
    'ModalDirectives',
    'TabDirectives'
  ]);

  /* Config */
  app.config( 
      [ '$httpProvider', function( $httpProvider ) {
    $httpProvider.interceptors.push( 'authInterceptor' );
  }]);

  /* Run */
  app.run( [ '$window', 'tokenManager', 'auth', function( $window, tokenManager, auth ) {

    // in the beginning, check if client has a token
    tokenManager.loadUserCredentials( function() {
      // if so, check if the token is valid
      auth.getUser();
    });

    // if '/' but user is authenticated, then go to '/home'
    if( $window.location.pathname == '/' ) {
      if( auth.isAuthenticated() ) {
        $window.location.href = '/home';
      } 
    } 

    // if '/home' but user is not authenticated, then go to '/'
    if( $window.location.pathname == '/home' ) {
      if( !auth.isAuthenticated() ) {
        $window.location.href = '/';
      }
    }

  }]);
})();
