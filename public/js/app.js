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
  app.config( [ '$httpProvider', function( $httpProvider ) {
    $httpProvider.interceptors.push( 'authInterceptor' );
  }]);

  /* Run */
  app.run( [ '$window', 'auth', function( $window, auth ) {

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
