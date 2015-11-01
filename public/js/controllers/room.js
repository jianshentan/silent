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

    $scope.guests = 0;
    $scope.showRoomInfo = false;

    /* MODAL BUTTONS =====================================*/

    // close notification
    $scope.closeNotification = function( $event ) {
      $( $event.target ).parent().slideUp( 'slow' ); 
    };

    // open room info 
    $scope.roomInfo = function() {
      $scope.showRoomInfo = !$scope.showRoomInfo;
    };

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

    // logs user out TODO: deprecated?
    $scope.logout = function() {
      $rootScope.$emit( 'modalSwitch', { modal: 'logout' } );
    };
 
    // transform a number into an array
    $scope.arrayify = function( num ) {
      return num == 0 ? null : new Array( num );
    };

    $scope.guestsToDisplay = function() {
      var guests = $scope.guests;
      return auth.isAuthenticated() ?
        ( !guests || guests == 0 ? null : new Array(guests) ) :
        ( !guests || guests == 0 ? null : new Array(guests - 1) );
    };

    /* EVENT MANAGERS =====================================*/

    // update users
    $rootScope.$on( 'updateUsers', function( event, args ) {
      $scope.activeUsers = args.activeUsers.length + ( auth.isAuthenticated() ? 1 : 0 );
      $scope.inactiveUsers = args.inactiveUsers.length;
      $scope.guests = args.guests;
      $scope.totalUsers = ($scope.activeUsers ? parseInt($scope.activeUsers) : 0 ) + 
                          ($scope.inactiveUsers ? parseInt($scope.inactiveUsers) : 0 ) + 
                          ($scope.guests ? parseInt($scope.guests) : 0) ;
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
      var selectedUsers = [];
      for( var i in self.users ) {
        if( active ? self.users[i].active : !self.users[i].active ) {
          selectedUsers.push( self.users[i] );
        }
      }
      return selectedUsers;
    };

    /* set a specified userId in the userlist to the specified state */
    this.setActiveState = function( id, state, cb ) {
      for( var i in self.users ) {
        if( self.users[i].userId == id ) {
          self.users[i].active = state;
        }
      }
      if( cb ) {
        cb();
      }
    };

    /* private function > updates active/inactive user lists to views */
    this.updateUserList = function() {
      $scope.activeUsers = self.getUsers( true );
      $scope.inactiveUsers = self.getUsers( false );
    };

    /* listen for user update */
    $rootScope.$on( 'userUpdate', function( event, args ) {
    });

    // update user count 
    $rootScope.$on( 'getUsers', function( event, args ) {
      // if guest count is passed in, use it, otherwise set to 0
      var guests = 0;
      if( args ) {
        guests = args.guestCount;
      } else {
        guests = $scope.guests;
      }

      $rootScope.$emit( 'updateUsers', { 
        activeUsers: self.getUsers( true ), 
        inactiveUsers: self.getUsers( false ),
        guests: guests
      });
    });

    /* SOCKET Handling ==================================================*/ 

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

      /* receive list of users from socket-connection */
      for( var i in data.users ) {
        if( data.users[i].id != userId ) {
          self.users.push( new user({
            userId: data.users[i].id,
            displayName: data.users[i].displayName,
            active: true
          }));
        }
      }

      /* receive list of ghosts from socket-connection */
      for( var i in data.ghosts ) {
        self.users.push( new user({
          userId: data.ghosts[i].id,
          displayName: data.ghosts[i].displayName,
          active: false
        }));
      }

      self.updateUserList();

      // update user counter in room 
      $rootScope.$emit( 'getUsers', { guestCount: data.numGuests } );
    });

    socket.on( 'visitor entered', function( data ) {
      console.log( 'visitor entered: ' + JSON.stringify( data.user ) );

      // check if user already exists in userlist
      var isExistingUser = false;
      for( var i in self.users ) {
        if( self.users[i].userId == data.user.userId ) {
          isExistingUser = true; 
        }
      }
      
      // create a user object and add it to the user list
      if( !isExistingUser ) {
        self.users.push( new user( { 
          userId: data.user.userId,
          displayName: data.user.displayName,
          active: true
        } ) );
        self.updateUserList();

        // update user counter in room 
        $rootScope.$emit( 'getUsers' );

      } 
      // set user to active
      else {
        self.setActiveState( data.user.userId, true, function() {
          self.updateUserList();

          // update user counter in room 
          $rootScope.$emit( 'getUsers' );

        });
      }
    });

    socket.on( 'visitor left', function( data ) {
      console.log( 'visitor left:' + data.userId );
      self.setActiveState( data.userId, false, function() {
        self.updateUserList();

        // update user counter in room 
        $rootScope.$emit( 'getUsers' );
      });
    });

    socket.on( 'guest entered', function( data ) {
      console.log( 'guest entered : ' + data.numGuests );

      // update user counter in room 
      $rootScope.$emit( 'getUsers', { guestCount: data.numGuests } );
    });

    socket.on( 'guest left', function( data ) {
      console.log( 'guest left : ' + data.numGuests );

      // update user counter in room 
      $rootScope.$emit( 'getUsers', { guestCount: data.numGuests } );

    });

  }]);

})();
