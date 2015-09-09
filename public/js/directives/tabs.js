(function() {

  /* TabDirectives []: 
     'silJoinTab' --> join tab 
     'silUserTab' --> other user tab 
     'silMyUserTab' --> my use tab
  */
  var app = angular.module( 'TabDirectives', []);

  app.directive( 'silJoinTab', 
      [ '$rootScope', 'myUser', function( $rootScope, myUser ) {
    return {
      restrict: 'E',
      scope: {},
      templateUrl: 'templates/sil-join-tab.html',
      controller: function( $scope, $element ) {
        $scope.displayName = 'a guest';
      },
      link: function( scope, el, attr ) {
        $rootScope.$on( 'userUpdate', function( event, args ) {
          scope.displayName = myUser.getDisplayName();
        });
      }
    };
  }]);

  app.directive( 'silUserTab', function() {
    return {
      restrict: 'E',
      scope: { 
        info: '='
      },
      templateUrl: 'templates/sil-user-tab.html'
    };
  });

  app.directive( 'silMyUserTab',
      [ '$rootScope', 'myUser', function( $rootScope, myUser ) {
      
    return {
      restrict: 'E',
      scope: {},
      templateUrl: 'templates/sil-my-user-tab.html',
      controller: function( $scope, $element ) {
        $scope.displayName = myUser.getDisplayName();
        $scope.message = myUser.getMessage();
      },
      link: function( scope, el, attr ) {
        $rootScope.$on( 'userUpdate', function( event, args ) {
          scope.displayName = myUser.getDisplayName();
          scope.message = myUser.getMessage();
        });
      }

    };

  }]);

})();
