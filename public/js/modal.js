(function() {
  var app = angular.module( 'Modal', [ 'Services' ] );

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

  app.directive( 'silSignupModal', 
      [ '$rootScope', 'auth', function( $rootScope, auth ) {

    return {
      restrict: 'E',
      scope: {},
      templateUrl: 'templates/sil-signup-modal.html',

      controller: function( $scope, $element ) {

        $scope.isValid = false;
        // TODO consider using $location for more robust functionality
        $scope.isSignupPage = window.location.pathname == '/signup';

        // form fields
        $scope.username = "";
        $scope.password = "";
        $scope.confirmation = "";

      },

      link: function( scope, el, attr ) {

        var MIN_PASSWORD_LENGTH = 3;
        var MIN_USERNAME_LENGTH = 3;

        // called when form fields are updated
        scope.updateForm = function() {
          if( scope.password.length >= MIN_PASSWORD_LENGTH &&
              scope.username.length >= MIN_USERNAME_LENGTH &&
              scope.password == scope.confirmation ) {
            scope.isValid = true; 
          } else {
            scope.isValid = false; 
          }
        };
        
        // called on submit
        scope.submitSignupForm = function() {
          auth.signup( scope.username, scope.password, function() {
            $rootScope.$emit( 'modalSwitch', { modal: '' } );
            $rootScope.$emit( 'checkUserCredentials' );
          });
        };

        // called when toggling between login & signup
        scope.toggleAuthentication = function() {
          $rootScope.$emit( 'modalSwitch', { modal: 'login' } );
        };
      }

    };
  }]);

  app.directive( 'silLoginModal', 
      [ '$rootScope', 'auth', function( $rootScope, auth ) {

    return {
      restrict: 'E',
      scope: {},
      templateUrl: 'templates/sil-login-modal.html',
      
      controller: function( $scope, $element ) {

        $scope.isValid = false;
        // TODO consider using $location for more robust functionality
        $scope.isLoginPage = window.location.pathname == '/login';

        // form fields
        $scope.username = "";
        $scope.password = "";

      },

      link: function( scope, el, attr ) {

        // called when form fields are updated
        scope.updateForm = function() {
          if( scope.username.length > 0 &&
              scope.password.length > 0 ) {
            scope.isValid = true; 
          } else {
            scope.isValid = false; 
          }
        };

        // called on submit
        scope.submitLoginForm = function() {
          auth.login( scope.username, scope.password, function() {
            $rootScope.$emit( 'modalSwitch', { modal: '' } );
            $rootScope.$emit( 'checkUserCredentials' );
          });
        };

        // called when toggling between login & signup
        scope.toggleAuthentication = function() {
          $rootScope.$emit( 'modalSwitch', { modal: 'signup' } );
        };

      }
    };

  }]);

  app.directive( 'silLogoutModal', 
      [ '$rootScope', 'auth', function( $rootScope, auth ) {

    return {
      restrict: 'E',
      scope: {},
      templateUrl: 'templates/sil-logout-modal.html',
      link: function( scope, el, attr ) {

        // 'cancel' is pressed
        scope.cancel = function() {
          $rootScope.$emit( 'modalSwitch', { modal: '' } );  
        };

        // 'log me out' is pressed
        scope.accept = function() {
          $rootScope.$emit( 'modalSwitch', { modal: '' } );

          auth.logout( function() {
            $rootScope.$emit( 'checkUserCredentials' );
          });
        };

      }
    };

  }]);

})();

