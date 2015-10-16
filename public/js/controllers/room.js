(function() {

  /* RoomControllers includes:
     'RoomController' - manages the room
     'UserListController' - managers the user list
  */
  var app = angular.module( 'RoomControllers', [ 
    'UserServices', 
    'ModalDirectives',
    'UtilServices',
    'angularMoment'
  ]);

  /* Main Controller for Room View */
  app.controller( 'RoomController', 
      [ '$scope', '$rootScope', 'auth', 'myUser',
      function( $scope, $rootScope, auth, myUser ) {

    // set modal show/hide state
    $scope.showShareModal = false;
    $scope.showLoginModal = false;
    $scope.showLogoutModal = false;
    $scope.showSignupModal = false;

    $scope.room = roomId;
    $scope.user = {};
    $scope.joinedRoom = myUser.isJoined(); 
    $scope.displayName = 'guest';

    /* MODAL BUTTONS =====================================*/

    // open share modal
    $scope.openShareModal = function() {
      $rootScope.$emit( 'modalSwitch', { modal: 'share' } );
    };

    // open login/signup
    $scope.openCredentialsModal = function() {
      $rootScope.$emit( 'modalSwitch', { modal: 'signup' } );
    };

    // open user-page modal
    $scope.openUserPageModal = function() {
      $rootScope.$emit( 'modalSwitch', { modal: 'user-page' } );
    };

    // open join-room modal
    $scope.openJoinRoomModal = function() {
      if( auth.isAuthenticated() ) {
        $rootScope.$emit( 'modalSwitch', { modal: 'join-room' } );
      } else {
        $rootScope.$emit( 'modalSwitch', { modal: 'signup' } );
      }
    };

    // logs user out
    $scope.logout = function() {
      $rootScope.$emit( 'modalSwitch', { modal: 'logout' } );
    };
 
    /* EVENT MANAGERS =====================================*/

    // user-update event manager
    $rootScope.$on( 'userUpdate', function( event, args ) {
      $scope.user = myUser.serialize();
      $scope.displayName = myUser.getDisplayName();
      $scope.joinedRoom = myUser.isJoined();
      $scope.authenticated = auth.isAuthenticated();
    });
 
    // authentication event manager
    $rootScope.$on( 'checkUserCredentials', function( event, args ) {
      $scope.authenticated = auth.isAuthenticated();
    });

    // modal event manager
    $rootScope.$on( 'modalSwitch', function( event, args ) {
      var modal = args.modal;

      // first, hide all modals
      $scope.showLoginModal = false;
      $scope.showShareModal = false;
      $scope.showSignupModal = false;
      $scope.showUserPageModal = false;
      $scope.showJoinRoomModal = false;

      // if 'modal' is empty, close all modals
      switch( modal ) {
        case 'login':
          $scope.showLoginModal = true;
          break;
        case 'signup':
          $scope.showSignupModal = true;
          break;
        case 'user-page':
          $scope.showUserPageModal = true;
          break;
        case 'join-room':
          $scope.showJoinRoomModal = true;
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
      [ '$scope', '$rootScope', 'socket', 'user', 'auth', 'myUser',
      function( $scope, $rootScope, socket, user, auth, myUser ) {

    /* reference to self */
    var self = this;

    /* public variables */
    $scope.activeUsers = [];
    $scope.inactiveUsers = [];
    $scope.user = {};

    /* private variables */
    this.users = [];

    /* handle if user is logged in */
    var userId = myUser.userId;

    /* private function > gets active/inactive users */
    this.getUsers = function( active ) {
      var users = self.users;
      var selectedUsers = [];
      for( var i in users ) {
        if( users[i].userId !== userId ) {
          if( active ? users[i].active : !users[i].active ) {
            selectedUsers.push( users[i] );
          }
        }
      }
      return selectedUsers;
    };

    /* set a specified userId in the userlist to inactive */
    this.setInactive = function( id ) {
      var users = self.users;
      for( var i in users ) {
        if( users[i].userId == id ) {
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

    /* listen for user update */
    $rootScope.$on( 'userUpdate', function( event, args ) {
      $scope.user = myUser.serialize();
    });

    /* SOCKET Handling */ 

    // emit 'enter' - TODO decide if this is the right place for this
    socket.emit( 'enter', { roomId: roomId, userId: userId } );

    socket.on( 'entered', function( data ) {

      // receive this user object from socket-connection & set userId (if guest)
      if( userId ) {
        myUser.enterRoom( data.user, function() {
          $rootScope.$emit( 'userUpdate' );
        });
      } else {
        $scope.user = new user( data.user );
        userId = $scope.user.userId;
      }

      // receive list of users from socket-connection
      for( var i in data.users ) {
        if( data.users[i].userId != userId ) {
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

})();
