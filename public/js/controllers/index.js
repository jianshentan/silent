(function() {

  /* IndexControllers includes: 
     'IndexController' --> manages index page
  */
  var app = angular.module( 'IndexControllers', [
    'UserServices'
  ]);

  /* Main Controller for Index View */
  app.controller( 'IndexController', 
      [ '$scope', 'auth', function( $scope, auth ) {
    $scope.authenticated = auth.isAuthenticated();
  }]);

})();


