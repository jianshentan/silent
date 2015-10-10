(function() {

  /* HomeControllers includes: 
     'HomeController' --> manages home page
  */
  var app = angular.module( 'HomeControllers', [ 
    'UserServices',
    'HomeServices'
  ]);

  var JOIN_ROOM_TEXT_OPTIONS = {
    joinAsFirst: "Be the first inside",
    join: "Join"
  };

  /* Main Controller for Home View */
  app.controller( 'HomeController', [ '$scope', function( $scope ) {
  }]);

})();


