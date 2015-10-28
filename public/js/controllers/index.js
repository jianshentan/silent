(function() {

  /* IndexControllers includes: 
     'IndexController' --> manages index page
  */
  var app = angular.module( 'IndexControllers', [
    'UserServices'
  ]);

  /* Main Controller for Index View */
  app.controller( 'IndexController', 
      [ '$scope', 'auth', '$rootScope', 'myUser', '$window',
      function( $scope, auth, $rootScope, myUser, $window ) {
    
    $scope.scrollTo = function( selector ) {
      $( 'body' ).animate({ 
        scrollTop: $( selector ).offset().top
      }, 1000 );
    };
    
    $scope.logout = function() {
      myUser.logout( function() {
        $window.location.href = "/";
      });
    };

    /* EVENT MANAGERS ===================================== */

    // user-update event manager
    $rootScope.$on( 'userUpdate', function( event, args ) {
      $scope.authenticated = auth.isAuthenticated();
      $scope.displayName = myUser.getDisplayName();
    });

    /* HANDLE MOBILE QUIRKS ============================== */
    if( $rootScope.isMobile ) {
      $scope.howIsOpen = false;      
      $scope.searchIsOpen = false;

      /* Open How-To Page 
       * called when user clicks on the how button 
       */
      $scope.openHow = function() {
        $scope.howIsOpen = true;      
      };

      /* Close search
       * called when user clicks on close button
       */
      $scope.closeHow = function() {
        $scope.howIsOpen = false;
      };

    }

  }]);

})();


