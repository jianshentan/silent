(function() {

  /* ModalDirectives include:
     'silModal' --> generic modal wrapper
     'silShareModal' --> share modal
     'silLoginModal' --> login modal
     'silSignupModal' --> signup modal
     'silUserPageModal' --> confirmation to redirect to /home
     'silJoinRoomModal' --> join-room modal
  */

  var app = angular.module( 'ModalDirectives', [ 'UserServices' ] );

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
          var info = {
            username: scope.username,
            password: scope.password
          }
          auth.signup( info, 
            // success
            function() {
              $rootScope.$emit( 'modalSwitch', { modal: '' } );
              $rootScope.$emit( 'checkUserCredentials' );
            },
            // fail
            function() {
              scope.error = true;
              scope.errorMessage = "The username already exist."; 
              scope.password = "";
              scope.confirmation = "";
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
          var info = {
            username: scope.username,
            password: scope.password
          }
          auth.login( info, 
            //success
            function() {
              $rootScope.$emit( 'modalSwitch', { modal: '' } );
              $rootScope.$emit( 'checkUserCredentials' );
            }, 
            //fail
            function() {
              scope.error = true;
              scope.errorMessage = "Your username or password is incorrect.";
              scope.password = "";
            });
        };

        // called when toggling between login & signup
        scope.toggleAuthentication = function() {
          $rootScope.$emit( 'modalSwitch', { modal: 'signup' } );
        };

      }
    };

  }]);

  app.directive( 'silUserPageModal', 
      [ '$rootScope', '$window', function( $rootScope, $window ) {

    return {
      restrict: 'E',
      scope: {},
      templateUrl: 'templates/sil-user-page-modal.html',
      link: function( scope, el, attr ) {

        // 'cancel' is pressed
        scope.cancel = function() {
          $rootScope.$emit( 'modalSwitch', { modal: '' } );  
        };

        // 'OK' is pressed
        scope.accept = function() {
          $window.location.href = '/home';  
        };

      }
    };

  }]);

  app.directive( 'silJoinRoomModal',
      [ '$rootScope', 'myUser', 'auth', function( $rootScope, myUser, auth ) {
    
    return {
      restrict: 'E',
      scope: {},
      templateUrl: 'templates/sil-join-room-modal.html',
      controller: function( $scope, $element ) {
        $scope.username = myUser.getUsername();
        $scope.hasMessage = false;
        $scope.placeholder = "is present";
        $scope.message = "";
      },
      link: function( scope, el, attr ) {

        scope.messageChange = function() {
          if( scope.message.length > 0 ) {
            scope.hasMessage = true;
          } else {
            scope.hasMessage = false;
          }
        }

        // 'cancel' is pressed
        scope.cancel = function() {
          $rootScope.$emit( 'modalSwitch', { modal: '' } );
        };

        // 'Submit' is pressed 
        scope.joinRoom = function() {

          if( auth.isAuthenticated() ) {

            /* if user is logged in */
            // callback:
            myUser.joinRoom( { message: scope.message }, function() {
              $rootScope.$emit( 'modalSwitch', { modal: '' } );
              $rootScope.$emit( 'userUpdate' ); // maybe this should go elsewhere..
            });

          } else {
            // TODO handle if user is logged out

          }

        };

      }
    };
        
  }]);

})();

