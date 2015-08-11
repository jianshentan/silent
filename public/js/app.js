(function() {

  var app = angular.module( 'Silent', [ 'Services', 'User' ] );

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
    var users = [];

    /* private function > gets active/inactive users */
    this.getUsers = function( active ) {
      var selectedUsers = [];
      for( var i in users ) {
        console.log( users[i].userId );
        console.log( $scope.user.userId );
        if( users[i].userId !== $scope.user.userId ) {
          if( active ? users[i].active : !users[i].active ) {
            selectedUsers.push( users[i] );
          }
        }
      }
      return selectedUsers;
    };

    // emit 'enter' - TODO decide if this is the right place for this
    socket.emit( 'enter', { room_id: roomId } );

    socket.on( 'entered', function( data ) {

      $scope.user = new user( data.user.user_id, 
                              data.user.username, 
                              data.user.visitor_count, 
                              data.user.guest, 
                              data.user.guest, 
                              data.user.active );

      for( var i in data.users ) {
        users.push( new user( 
                      data.users[i].user_id, 
                      data.users[i].username, 
                      data.users[i].visitor_count, 
                      data.users[i].guest,
                      data.users[i].active ) );
      }

      $scope.activeUsers = userListController.getUsers( true );
      $scope.inactiveUsers = userListController.getUsers( false );

    });

    socket.on( 'visitor entered', function( data ) {
      console.log( data.username );
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

  app.directive( 'inactiveTab', function() {
    return {
      restrict: 'E',
      scope: { 
        info: '='
      },
      templateUrl: 'templates/inactive-tab.html'
    };
  });

  userlist = {
    activeUsers: [
      {
        name: 'jstanactive',
        message: 'is present'
      },
      {
        name: 'jjtan',
        message: 'is present'
      },
      {
        name: 'minsoo',
        message: 'is present'
      },
      {
        name: 'kevin',
        message: 'is present'
      },
      {
        name: 'lukas',
        message: 'is present'
      },
      {
        name: 'david',
        message: 'is present'
      }
    ],
    inactiveUsers: [
      {
        name: 'jstaninactive',
        message: 'is present'
      },
      {
        name: 'jjtan',
        message: 'is present'
      },
      {
        name: 'minsoo',
        message: 'is present'
      },
      {
        name: 'kevin',
        message: 'is present'
      },
      {
        name: 'lukas',
        message: 'is present'
      },
      {
        name: 'david',
        message: 'is present'
      }
    ]
  };
})();
