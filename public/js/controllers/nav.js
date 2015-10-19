(function() {

  /* NavControllers includes: 
   * 'NavController' --> manages Navigation bar 
   */
  var app = angular.module( 'NavControllers', [ 
    'UserServices',
    'HomeServices'
  ]);

  var JOIN_ROOM_TEXT_OPTIONS = {
    joinAsFirst: "Be the first inside",
    join: "Join"
  };

  /* Nav Controller */
  app.controller( 'NavController',
      [ '$scope', '$rootScope', '$window', 'auth', 'myUser', '$timeout', 'search',
      function( $scope, $rootScope, $window, auth, myUser, $timeout, search ) {

    $scope.authenticated = auth.isAuthenticated();
    
    $scope.logout = function() {
      myUser.logout( function() {
        $rootScope.$emit( 'checkUserCredentials' );
        $window.location.href = '/';
      })
    };

    $scope.searchQuery = "";
    $scope.showSearchResults = false;
    $scope.joinText = JOIN_ROOM_TEXT_OPTIONS.joinAsFirst;

    /* Keypress listener 
     * called on keypress
     */
    $scope.onKeyPress = function( e ) {
      if( e.which === 32 ) {
        e.preventDefault(); 
      }
    };

    /* Update Search
     * called on type inside the search input box
     */
    $scope.updateSearch = function() {
      if( $scope.searchQuery.length < 1 ) {
        $scope.showSearchResults = false;
      } else {
        search.search( $scope.searchQuery, 
          // success
          function( results ) {
            $scope.searchResults = results;
          }, 
          // fail
          null, 
          // forever
          function() {
            $scope.showSearchResults = true;

            // if query is a subset of searchResults, change Join Text
            var results = $scope.searchResults;
            for( var i in results ) {
              if( results[i].name == $scope.searchQuery ) {
                $scope.joinText = JOIN_ROOM_TEXT_OPTIONS.join;
              }
            }
          });
      }
    };

    /* Blur
     * called when user clicks out of the search bar
     */
    $scope.blur = function() {
      $timeout( function() {
        $scope.showSearchResults = false;
      }, 1000 );
    };

    /* Enter Room 
     * called when user clicks on the join/create button in the search result
     */
    $scope.enterRoom = function() {
      $window.location.href = '/@'+$scope.searchQuery;
    };

    /* EVENT MANAGERS ===================================== */

    // user-update event manager
    $rootScope.$on( 'userUpdate', function( event, args ) {
      $scope.user = myUser.serialize();
      $scope.displayName = myUser.getDisplayName();
      $scope.authenticated = auth.isAuthenticated();
    });

    /* HANDLE MOBILE QUIRKS ============================== */
    if( $rootScope.isMobile ) {

      /* Open Search
       * called when user clicks on the search bar
       */
      $scope.openSearch = function() {
        $scope.showSearchResults = true;
        $scope.$parent.searchIsOpen = true;
      };

      /* close search
       * called when user clicks on close-search
       */
      $scope.closeSearch = function() {
        $scope.showSearchResults = false;
        $scope.$parent.searchIsOpen = false;
      };
    }

  }]);

})();


