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

  app.directive( 'silModal', 
      [ '$rootScope', function( $rootScope ) {

    return {
      restrict: 'E',
      scope: {
        show: '='
      },
      replace: true, // Replace with the template below
      transclude: true, // we want to insert custom content inside the directive
      templateUrl: function() {
        return ( $rootScope.isMobile ) ?
          'templates/m-sil-modal.html' : 
          'templates/sil-modal.html';
      },
      link: function( scope, element, attrs ) {
        scope.hideModal = function() {
          scope.show = false;
        };
      }
    };

  }]);

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
      templateUrl: function() {
        return ( $rootScope.isMobile ) ? 
          'templates/m-sil-signup-modal.html' :
          'templates/sil-signup-modal.html';
      },

      controller: function( $scope, $element ) {

        $scope.isValid = false;
        // TODO consider using $location for more robust functionality
        $scope.isSignupPage = window.location.pathname == '/signup' ||
                              window.location.pathname == '/m_signup';

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
          auth.signup( scope.username, scope.password, 
            // success
            function() {

              if( scope.isSignupPage ) {
                window.location.href= "/home";
              } else {

                // close modal 
                $rootScope.$emit( 'modalSwitch', { modal: '' } );

                // update authentication status in the room controller
                $rootScope.$emit( 'userUpdate' );
              }

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
          if( scope.isSignupPage ) {
            window.location.href = "/login";
          } else {
            $rootScope.$emit( 'modalSwitch', { modal: 'login' } );
          }
        };
      }

    };
  }]);

  app.directive( 'silLoginModal', 
      [ '$rootScope', 'auth', function( $rootScope, auth ) {

    return {
      restrict: 'E',
      scope: {},
      templateUrl: function() {
        return ( $rootScope.isMobile ) ? 
          'templates/m-sil-login-modal.html' :
          'templates/sil-login-modal.html';
      },

      controller: function( $scope, $element ) {

        $scope.isValid = false;
        // TODO consider using $location for more robust functionality
        $scope.isLoginPage = window.location.pathname == '/login' ||
                             window.location.pathname == '/m_login';

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
          auth.login( scope.username, scope.password, 
            //success
            function() {

              if( scope.isLoginPage ) {
                window.location.href= "/home";
              } else {

                // close modal 
                $rootScope.$emit( 'modalSwitch', { modal: '' } );

                // update authentication status in the room controller
                $rootScope.$emit( 'userUpdate' );

              }

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
          if( scope.isLoginPage ) {
            window.location.href = "/signup";
          } else {
            $rootScope.$emit( 'modalSwitch', { modal: 'signup' } );
          }
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
      templateUrl: function() {
        return ( $rootScope.isMobile ) ? 
          'templates/m-sil-join-room-modal.html' :
          'templates/sil-join-room-modal.html';
      },

      controller: function( $scope, $element ) {
        $scope.displayName = myUser.getDisplayName();
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
        };

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

        $rootScope.$on( 'userUpdate', function( event, args ) {
          scope.displayName = myUser.getDisplayName()
        });

      }
    };
        
  }]);

})();

