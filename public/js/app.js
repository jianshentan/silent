(function() {

  var app = angular.module( 'Silent', [ 
    'Services', 
    'User', 
    'Modal',
    'angularMoment'
  ]);

  /* test TODO: delete */
  app.factory( 'room', [ '$http', function( $http ) {
    return $http.get( '/' )
      .success( function( data ) { return data; })
      .error( function( err ) { return err; });
  }]);

  app.controller( 'RoomController', [ '$scope', function( $scope ) {
    $scope.showShareModal = false;
    $scope.room = roomId;

    // open share modal
    $scope.openShareModal = function() {
      $scope.showShareModal = true;
    };

  }]);

  app.controller( 'SignupController', [ '$scope', function( $scope ) {
    $scope.isValid = false;

    // form fields
    $scope.username = "";
    $scope.password = "";
    $scope.confirmation = "";

    // called when form fields are updated
    $scope.updateForm = function() {
      if( $scope.password.length > 0 &&
          $scope.username.length > 0 &&
          $scope.password == $scope.confirmation ) {
        $scope.isValid = true; 
      } else {
        $scope.isValid = false; 
      }
    };
  }]);

  app.controller( 'LoginController', [ '$scope', function( $scope ) {
    $scope.isValid = false;

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
