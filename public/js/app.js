(function() {

  var app = angular.module( 'Silent', [ 'Services', 'User', 'angularMoment' ] );

  /* test TODO: delete */
  app.factory( 'room', [ '$http', function( $http ) {
    return $http.get( '/' )
      .success( function( data ) { return data; })
      .error( function( err ) { return err; });
  }]);

  app.controller( 'NavigationController', 
    [ '$scope', 'room', function( $scope, room ) {
    $scope.room_name = roomId;
  }]);

  app.controller( 'UserListController', 
    [ '$scope', 'socket', 'user',  
    function( $scope, socket, user ) {

    /* reference to self */
    var userListController = this;

    /* public variables */
    $scope.activeUsers = [];
    $scope.inactiveUsers = [];
    $scope.user;

    /* private variables */
    this.users = [];

    /* private function > gets active/inactive users */
    this.getUsers = function( active ) {
      var users = userListController.users;
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
      var users = userListController.users;
      for( var i in users ) {
        if( users[i].userId == userId ) {
          users[i].active = false;
        }
      }
      userListController.updateUserList();
    };

    /* private function > updates active/inactive user lists to views */
    this.updateUserList = function() {
      $scope.activeUsers = userListController.getUsers( true );
      $scope.inactiveUsers = userListController.getUsers( false );
    };

    // emit 'enter' - TODO decide if this is the right place for this
    socket.emit( 'enter', { room_id: roomId } );

    socket.on( 'entered', function( data ) {

      $scope.user = new user( data.user );

      for( var i in data.users ) {
        if( data.users[i].userId != $scope.user.userId ) {
          userListController.users.push( new user( data.users[i] ) );
        }
      }

      userListController.updateUserList();
    });

    socket.on( 'visitor entered', function( data ) {
      userListController.users.push( new user( data.user ) );
      userListController.updateUserList();
    });

    socket.on( 'visitor left', function( data ) {
      userListController.setInactive( data.userId );
    });

  }]);

  app.directive( 'joinTab', function() {
    return {
      restrict: 'E',
      scope: {},
      templateUrl: 'templates/join-tab.html',
      link: function( scope, el, attrs ) {
        scope.roomId = roomId;
      }
    };
  });

  app.directive( 'userTab', function() {
    return {
      restrict: 'E',
      scope: { 
        info: '='
      },
      templateUrl: 'templates/user-tab.html'
    };
  });

})();
