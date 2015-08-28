(function() {

  var app = angular.module( 'Silent', [ 
    'Services', 
    'User', 
    'Modal',
    'angularMoment'
  ]);

  /* Config */
  app.config( [ '$httpProvider', function( $httpProvider ) {
    $httpProvider.interceptors.push( 'authInterceptor' );
  }]);

  /* Run */
  app.run( [ '$window', 'auth', function( $window, auth ) {

    // if '/' but user is authenticated, then go to '/home'
    if( $window.location.pathname == '/' ) {
      if( auth.isAuthenticated() ) {
        $window.location.href = '/home';
      } 
    } 

    // if '/home' but user is not authenticated, then go to '/'
    if( $window.location.pathname == '/home' ) {
      if( !auth.isAuthenticated() ) {
        $window.location.href = '/';
      }
    }

  }]);

  /* Main Controller for Home View */
  app.controller( 'HomeController',
      [ '$scope', '$rootScope', '$window', 'auth', 
      function( $scope, $rootScope, $window, auth ) {

    $scope.authenticated = auth.isAuthenticated();
    
    $scope.logout = function() {
      auth.logout( function() {
        $rootScope.$emit( 'checkUserCredentials' );
        $window.location.href = '/';
      });
    };

  }]);

  /* Main Controller for Room View */
  app.controller( 'RoomController', 
      [ '$scope', '$rootScope', 'auth', function( $scope, $rootScope, auth ) {

    // set modal show/hide state
    $scope.showShareModal = false;
    $scope.showLoginModal = false;
    $scope.showLogoutModal = false;
    $scope.showSignupModal = false;

    $scope.room = roomId;
    $scope.user = {};
    $scope.authenticated = auth.isAuthenticated();

    $rootScope.$on( 'userUpdate', function( event, args ) {
      $scope.user = auth.getUser();
    });

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
      $rootScope.$emit( 'modalSwitch', { modal: 'logout' } );
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

  app.controller( 'UserListController', 
      [ '$scope', '$rootScope', 'socket', 'user', 'auth',
      function( $scope, $rootScope, socket, user, auth ) {

    /* reference to self */
    var self = this;

    /* public variables */
    $scope.activeUsers = [];
    $scope.inactiveUsers = [];
    $scope.user = {};

    /* private variables */
    this.users = [];

    /* listen for user update */
    $rootScope.$on( 'userUpdate', function( event, args ) {
      $scope.user = auth.getUser();
    });

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

      // receive this user object from socket-connection
      auth.setUser( data.user );
      //$scope.user = new user( data.user );

      // receive list of users from socket-connection
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
