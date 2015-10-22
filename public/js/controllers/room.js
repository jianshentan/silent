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
    $scope.displayName;
    $scope.authenticated = auth.isAuthenticated();

    $scope.activeGuests = 0;

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

    // update active guest count
    $rootScope.$on( 'guestUpdate', function( event, args ) {
      var guests = args.guestCount;
      $scope.activeGuests = guests;
    });

    // user-update event manager
    $rootScope.$on( 'userUpdate', function( event, args ) {
      // $scope.user = myUser.serialize();
      $scope.displayName = myUser.getDisplayName();
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
    var userId;

    /* getUsers gets users based on the 'active' parameter */
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
    });

    /* SOCKET Handling */ 

    // emit 'enter' - TODO decide if this is the right place for this
    socket.emit( 'enter', { roomId: roomId } );

    socket.on( 'entered', function( data ) {
      console.log( 'ENTERED: ' + JSON.stringify( data ) );

      /* handle user object (or guest) from socket-connection */

      // if is a user
      if( data.user ) {
        myUser.enterRoom( null, function() {
          $rootScope.$emit( 'userUpdate' );
        });
      } 
      // if is a guest
      else {
        $rootScope.$emit( 'guestUpdate', { guestCount: data.numGuests } );
      }

      /* receive list of users from socket-connection */
      for( var i in data.users ) {
        if( data.users[i].userId != userId ) {
          self.users.push( new user( data.users[i] ) );
        }
      }

      self.updateUserList();
    });

    socket.on( 'visitor entered', function( data ) {
      /*
       * 1. create a 'user' object, set active state
       * 2. add user to 'users' list
       * 3. call updateUserList to update views
       */
      console.log( 'visitor entered: ' + JSON.stringify( data.user ) );
      self.users.push( new user( data.user ) );
      self.updateUserList();
    });

    socket.on( 'visitor left', function( data ) {
      /*
       * 1. set that visitor to be inactive
       * 2. call updateUserList to update views
       */
      console.log( 'visitor left:' + data.userId );
      self.setInactive( data.userId );
    });

    socket.on( 'guest entered', function( data ) {
      console.log( 'guest entered : ' + data.numGuests );
      $rootScope.$emit( 'guestUpdate', { guestCount: data.numGuests } );
    });

    socket.on( 'guest left', function( data ) {
      console.log( 'guest left : ' + data.numGuests );
      $rootScope.$emit( 'guestUpdate', { guestCount: data.numGuests } );
    });

  }]);

})();
