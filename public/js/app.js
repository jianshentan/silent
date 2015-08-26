(function() {

  var app = angular.module( 'Silent', [ 
    'Services', 
    'User', 
    'Modal',
    'angularMoment'
  ]);

  app.controller( 'RoomController', [ '$scope', '$rootScope', 'auth', function( $scope, $rootScope, auth ) {

    // set modal show/hide state
    $scope.showShareModal = false;
    $scope.showLoginModal = false;
    $scope.showLogoutModal = false;
    $scope.showSignupModal = false;

    $scope.room = roomId;
    $scope.authenticated = auth.isAuthenticated();

    // open share modal
    $scope.openShareModal = function() {
      $rootScope.$emit( 'modalSwitch', { modal: 'share' } );
    };

    // open login/signup
    $scope.openCredentialsModal = function() {
      $rootScope.$emit( 'modalSwitch', { modal: 'signup' } );
    };

    // logs user out
    $scope.logout = function() {
      // TODO perhaps a modal should appear to confirm logout
      $rootScope.$emit( 'modalSwitch', { modal: 'logout' } );

      auth.logout( function() {
        $scope.authenticated = auth.isAuthenticated();
      });
    };
  
    // authentication event manager
    $rootScope.$on( 'checkUserCredentials', function( event, args ) {
      $scope.authenticated = auth.isAuthenticated();
    });

    // modal event manager
    $rootScope.$on( 'modalSwitch', function( event, args ) {
      var modal = args.modal;

      // first, hide all modals
      $scope.showLoginModal = false;
      $scope.showLogoutModal = false;
      $scope.showShareModal = false;
      $scope.showSignupModal = false;

      // if 'modal' is empty, close all modals
      switch( modal ) {
        case 'login':
          $scope.showLoginModal = true;
          break;
        case 'signup':
          $scope.showSignupModal = true;
          break;
        case 'logout':
          $scope.showLogoutModal = true;
          break;
        case 'share':
          $scope.showShareModal = true;
          break;
        default:
          break;
      }
    });  

  }]);

  app.controller( 'SignupController', [ '$scope', '$rootScope', 'auth', function( $scope, $rootScope, auth ) {

    var MIN_PASSWORD_LENGTH = 3;
    var MIN_USERNAME_LENGTH = 3;

    $scope.isValid = false;
    // TODO consider using $location for more robust functionality
    $scope.isSignupPage = window.location.pathname == '/signup';

    // form fields
    $scope.username = "";
    $scope.password = "";
    $scope.confirmation = "";

    // called when form fields are updated
    $scope.updateForm = function() {
      if( $scope.password.length >= MIN_PASSWORD_LENGTH &&
          $scope.username.length >= MIN_USERNAME_LENGTH &&
          $scope.password == $scope.confirmation ) {
        $scope.isValid = true; 
      } else {
        $scope.isValid = false; 
      }
    };

    // called on submit
    $scope.submitSignupForm = function() {
      auth.signup( $scope.username, $scope.password, function() {
        $rootScope.$emit( 'modalSwitch', { modal: '' } );
        $rootScope.$emit( 'checkUserCredentials' );
      });
    };

    // called when toggling between login & signup
    $scope.toggleAuthentication = function() {
      $rootScope.$emit( 'modalSwitch', { modal: 'login' } );
    };

  }]);

  app.controller( 'LoginController', [ '$scope', '$rootScope', 'auth', function( $scope, $rootScope, auth ) {

    $scope.isValid = false;
    // TODO consider using $location for more robust functionality
    $scope.isLoginPage = window.location.pathname == '/login';

    // form fields
    $scope.username = "";
    $scope.password = "";

    // called when form fields are updated
    $scope.updateForm = function() {
      if( $scope.username.length > 0 &&
          $scope.password.length > 0 ) {
        $scope.isValid = true; 
      } else {
        $scope.isValid = false; 
      }
    };

    // called on submit
    $scope.submitLoginForm = function() {
      auth.login( $scope.username, $scope.password, function() {
        $rootScope.$emit( 'modalSwitch', { modal: '' } );
        $rootScope.$emit( 'checkUserCredentials' );
      });
    };

    // called when toggling between login & signup
    $scope.toggleAuthentication = function() {
      $rootScope.$emit( 'modalSwitch', { modal: 'signup' } );
    };

  }]);

  app.controller( 'NavigationController', [ '$scope', function( $scope ) {
  }]);

  app.controller( 'UserListController', 
    [ '$scope', 'socket', 'user',  
    function( $scope, socket, user ) {

    /* reference to self */
    var self = this;

    /* public variables */
    $scope.activeUsers = [];
    $scope.inactiveUsers = [];
    $scope.user = {};

    /* private variables */
    this.users = [];

    /* private function > gets active/inactive users */
    this.getUsers = function( active ) {
      var users = self.users;
      var selectedUsers = [];
      for( var i in users ) {
        if( users[i].userId !== $scope.user.userId ) {
          if( active ? users[i].active : !users[i].active ) {
            selectedUsers.push( users[i] );
          }
        }
      }
      return selectedUsers;
    };

    this.setInactive = function( userId ) {
      var users = self.users;
      for( var i in users ) {
        if( users[i].userId == userId ) {
          users[i].active = false;
        }
      }
      self.updateUserList();
    };

    /* private function > updates active/inactive user lists to views */
    this.updateUserList = function() {
      $scope.activeUsers = self.getUsers( true );
      $scope.inactiveUsers = self.getUsers( false );
    };

    // emit 'enter' - TODO decide if this is the right place for this
    socket.emit( 'enter', { room_id: roomId } );

    socket.on( 'entered', function( data ) {

      $scope.user = new user( data.user );

      for( var i in data.users ) {
        if( data.users[i].userId != $scope.user.userId ) {
          self.users.push( new user( data.users[i] ) );
        }
      }

      self.updateUserList();
    });

    socket.on( 'visitor entered', function( data ) {
      self.users.push( new user( data.user ) );
      self.updateUserList();
    });

    socket.on( 'visitor left', function( data ) {
      self.setInactive( data.userId );
    });

  }]);

  app.directive( 'silJoinTab', function() {
    return {
      restrict: 'E',
      scope: {},
      templateUrl: 'templates/sil-join-tab.html'
    };
  });

  app.directive( 'silUserTab', function() {
    return {
      restrict: 'E',
      scope: { 
        info: '='
      },
      templateUrl: 'templates/sil-user-tab.html'
    };
  });

})();
