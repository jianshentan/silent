(function() {

  /* HomeControllers includes: 
     'HomeController' --> manages home page
  */
  var app = angular.module( 'HomeControllers', [ 
    'UserServices',
    'HomeServices'
  ]);

  /* Main Controller for Home View */
  app.controller( 'HomeController', [ '$scope', function( $scope ) {
  }]);

})();


