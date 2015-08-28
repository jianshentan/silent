(function() {

  /* HomeControllers includes: 
     'HomeController' --> manages home page
  */
  var app = angular.module( 'HomeControllers', [ 
    'UserServices'
  ]);

  /* Main Controller for Home View */
  app.controller( 'HomeController',
      [ '$scope', '$rootScope', '$window', 'auth', 
      function( $scope, $rootScope, $window, auth ) {

    $scope.authenticated = auth.isAuthenticated();
    
    $scope.logout = function() {
      auth.logout( function() {
        $rootScope.$emit( 'checkUserCredentials' );
        $window.location.href = '/';
      })
    };

  }]);

})();


