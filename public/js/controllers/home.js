(function() {

  /* HomeControllers includes: 
     'HomeController' --> manages home page
  */
  var app = angular.module( 'HomeControllers', [ 
    'UserServices'
  ]);

  /* Main Controller for Home View */
  app.controller( 'HomeController',
      [ '$scope', '$rootScope', '$window', 'auth', 'myUser',
      function( $scope, $rootScope, $window, auth, myUser ) {

    $scope.authenticated = auth.isAuthenticated();
    
    $scope.logout = function() {
      myUser.logout( function() {
        $rootScope.$emit( 'checkUserCredentials' );
        $window.location.href = '/';
      })
    };

  }]);

})();


