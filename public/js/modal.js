(function() {
  var app = angular.module( 'Modal', [] );

  app.directive( 'silModal', function() {
    return {
      restrict: 'E',
      scope: {
        show: '='
      },
      replace: true, // Replace with the template below
      transclude: true, // we want to insert custom content inside the directive
      templateUrl: 'templates/sil-modal.html', 
      link: function( scope, element, attrs ) {
        scope.hideModal = function() {
          scope.show = false;
        };
      }
    };
  });

  app.directive( 'silShareModal', function() {
    return {
      restrict: 'E',
      scope: {},
      templateUrl: 'templates/sil-share-modal.html'
    };
  });

  app.directive( 'silSignupModal', function() {
    return {
      restrict: 'E',
      scope: {},
      templateUrl: 'templates/sil-signup-modal.html'
    };
  });

  app.directive( 'silLoginModal', function() {
    return {
      restrict: 'E',
      scope: {},
      templateUrl: 'templates/sil-login-modal.html'
    };
  });

})();

