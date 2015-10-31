(function() {

  /* NavControllers includes: 
   * 'NavController' --> manages Navigation bar 
   */
  var app = angular.module( 'NavControllers', [ 
    'UserServices',
    'HomeServices'
  ]);

  var SEARCH_TEXT_OPTIONS = {
    joinAsFirst: "Be the first inside @",
    join: "Join @",
    trending: "Type to search for rooms"
  };

  /* Nav Controller */
  app.controller( 'NavController',
      [ '$scope', '$rootScope', '$window', 'auth', 'myUser', '$timeout', 'search', 
      function( $scope, $rootScope, $window, auth, myUser, $timeout, search ) {

    $scope.logout = function() {
      myUser.logout( function() {
        $rootScope.$emit( 'checkUserCredentials' );
        $window.location.href = '/';
      });
    };

    $scope.searchQuery = "";
    $scope.showResults = false;
    $scope.trendingResults = false;
    $scope.searchText = SEARCH_TEXT_OPTIONS.trending;

    /* Keypress listener 
     * called on keypress
     */
    $scope.onKeyPress = function( e ) {
      if( e.which === 32 ) {
        e.preventDefault(); 
      }
    };

    /* Show Trending Rooms
     * called on click
     */
    $scope.showTrending = function() {
      $scope.showResults = true;
      $scope.trendingResults = true;
      if( $scope.searchQuery.length < 1 ) {
        search.search( '', function( results ) {
          $scope.results = results;
          $scope.searchText = SEARCH_TEXT_OPTIONS.trending;
        });
      }
    };

    /* Update Search
     * called on type inside the search input box
     */
    $scope.updateSearch = function() {
      if( $scope.searchQuery.length < 1 ) {
        $scope.showTrending();
      } else {
        $scope.trendingResults = false;
        search.search( $scope.searchQuery, 

          // success
          function( results ) {
            $scope.results = results;
          }, 

          // fail
          function() {}, 

          // forever
          function() {
            $scope.showResults = true;

            // if query is a subset of searchResults, change Join Text
            var results = $scope.results;
            $scope.searchText = SEARCH_TEXT_OPTIONS.joinAsFirst;
            for( var i in results ) {
              if( results[i].room == $scope.searchQuery ) {
                $scope.searchText = SEARCH_TEXT_OPTIONS.join;
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
        $scope.showResults = false;
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
        $scope.showResults = true;
        $scope.$parent.searchIsOpen = true;
      };

      /* close search
       * called when user clicks on close-search
       */
      $scope.closeSearch = function() {
        $scope.showResults = false;
        $scope.$parent.searchIsOpen = false;
      };
    }

  }]);

})();


