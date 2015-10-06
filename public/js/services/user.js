(function() {

  /* UserServices includes: 
     'auth' --> manages authentication 
     'user' --> user class
  */
  var app = angular.module( 'UserServices', [ 'UtilServices' ] );

  /* Authentication */
  app.factory( 'auth', 
      [ '$http', '$rootScope', 'tokenManager', 'myUser', 
      function( $http, $rootScope, tokenManager, myUser ) {

    this.authenticated = false;

    /* param:cb is optional
     */
    function login( username, password, success, fail, finish ) {
      return $http.post( '/login', { username: username, password: password } )
        .success( function( data ) {
          // if login is successful, store token
          var token = data.token;
          tokenManager.storeUserCredentials( token );
          myUser.initializeUser( data.user );

          if( success ) {
            success();
          }
        })
        .error( function( data, status ) {
          // Erase the token if the user fails to log in
          tokenManager.destroyUserCredentials();

          if( fail ) {
            fail();
          }
        })
        .finally( function() {
          if( finish ) {
            finish();
          }
        });
    }

    /* param:cb is optional
     */
    function signup( username, password, success, fail, finish ) {
      return $http.post( '/signup', { username: username, password: password } )
        .success( function( data ) {
          // if signup is successful, store token
          var token = data.token;
          tokenManager.storeUserCredentials( token );
          myUser.initializeUser( data.user );

          if( success ) {
            success();
          }
        })
        .error( function( data, status ) {
          // Erase the token if the user fails to sign up 
          tokenManager.destroyUserCredentials();

          if( fail ) {
            fail();
          }
        })
        .finally( function() {
          if( finish ) {
            finish();
          }
        });
    }

    /* checks authentication starts by getting the user by sending token */
    function getUser( success, fail, finish ) {
      // if there is a token (in local storage):
      if( tokenManager.hasToken() ) {
        
        $http.post( '/auth', {} )
          .success( function( user ) {
            myUser.initializeUser( user );
            this.authenticated = true;

            if( success ) {
              success();
            }
          })
          .error( function( data, status ) {
            // Erase the token if the user fails to log in
            tokenManager.destroyUserCredentials();
            this.authenticated = false;

            if( fail ) {
              fail();
            }
          })
          .finally( function() {
            if( finish ) {
              finish();
            }
          });

      // if there is no token (in local storage):
      } else {
        this.authenticated = false;
        if( fail ) {
          fail();
        }
      }
    }

    function isAuthenticated() {
      return this.authenticated;
    }

    return {
      login: login,
      signup: signup,
      isAuthenticated: isAuthenticated,
      getUser: getUser,
      hasToken: tokenManager.hasToken
    };
  }]);

  /* My User Instance */
  app.factory( 'myUser', 
      [ 'tokenManager', '$rootScope',
      function( tokenManager, $rootScope ) {

    var MyUser = {};

    var roomInfo;
    var userId;
    var displayName;
    var hasJoined = false;
    var message;

    // getters
    MyUser.getDisplayName = function() { return displayName; };
    MyUser.getUserId = function() { return userId; };
    MyUser.isJoined = function() { return hasJoined; };
    MyUser.getMessage = function() { return message; };

    MyUser.initializeUser = function( data ) {
      userId = data.userId;
      displayName = data.displayName;
      $rootScope.$emit( 'userUpdate' );
    };

    // param:cb is optional
    MyUser.logout = function( cb ) {
      tokenManager.destroyUserCredentials();
      userId = null;
      displayName = null;
      if( cb ) {
        cb();
      }
    };

    // when user enters the room (hits the URL) 
    MyUser.enterRoom = function( data, cb ) {
      roomInfo = data;
      if( cb ) {
        cb();
      }
    };

    // when user actively joins the room
    MyUser.joinRoom = function( data, cb ) {
      hasJoined = true;
      message = data.message;
      if( cb ) {
        cb();
      }
    };

    // serialize for room controller
    MyUser.serialize = function( cb ) {
      return roomInfo;
    };

    return MyUser;

  }]);


  /* User Class */
  app.factory( 'user', [ function() {

    /* private properties */
    var enterTimes = [];
    var exitTimes = [];

    /* Constructor */
    function User( user ) {

      enterTimes = user.enterTimes;
      exitTimes = user.exitTimes;

      /* public properties */
      this.userId = user.userId;
      this.visitorCount = user.visitorCount;
      this.guest = user.guest;
      this.active = user.active;

      //TODO 
      var displayName = user.username;
      this.displayName = displayName;
      this.message = " is present";

      /* this.time is used for 'am-time-ago' which updates active 
         state duration in real time */
      this.time = new Date( Date.now() - this.getActiveDuration() );
    }

    /* private functions */
    function somePrivateFunction() {}

    /* public functions */
    User.prototype.getActiveDuration = function() {
      if( Math.abs(enterTimes.length - exitTimes.length) < 2 ) {
        var accumulator = 0;
        for( var i in exitTimes ) {
          accumulator += exitTimes[i] - enterTimes[i]; 
        }
        return accumulator;
      } else {
        console.error( this.userId + " has incorrect enter/exit times." );
        return null;
      }
      
    };

    /* return constructor */
    return User;
  }]);

})();
