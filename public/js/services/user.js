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

      var auth = this;

      return $http.post( '/login', { username: username, password: password } )
        .success( function( data ) {
          // if login is successful, store token
          var token = data.token;
          tokenManager.storeUserCredentials( token );
          myUser.initializeUser( data.user );
          auth.authenticated = true;

          if( success ) {
            success();
          }
        })
        .error( function( data, status ) {
          // Erase the token if the user fails to log in
          tokenManager.destroyUserCredentials();
          auth.authenticated = false;

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

      var auth = this;

      return $http.post( '/signup', { username: username, password: password } )
        .success( function( data ) {
          // if signup is successful, store token
          var token = data.token;
          tokenManager.storeUserCredentials( token );
          myUser.initializeUser( data.user );
          auth.authenticated = true;

          if( success ) {
            success();
          }
        })
        .error( function( data, status ) {
          // Erase the token if the user fails to sign up 
          tokenManager.destroyUserCredentials();
          auth.authenticated = false;

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
        
        var auth = this;

        $http.post( '/auth', {} )
          .success( function( user ) {
            myUser.initializeUser( user );
            auth.authenticated = true;

            if( success ) {
              success();
            }
          })
          .error( function( data, status ) {
            // Erase the token if the user fails to log in
            tokenManager.destroyUserCredentials();
            auth.authenticated = false;

            if( fail ) {
              fail();
            }
          })
          .finally( function() {

            // update user state 
            $rootScope.$emit( 'userUpdate' );

            if( finish ) {
              finish();
            }
          });

      // if there is no token (in local storage):
      } else {
        this.authenticated = false;

        // update user state 
        $rootScope.$emit( 'userUpdate' );

        if( finish ) {
          finish();
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

    // serialize for room controller TODO 
    MyUser.serialize = function( cb ) {
      return roomInfo;
    };

    return MyUser;

  }]);


  /* User Class */
  // TODO a lot is deprecated - think about what we need to keep and we dont
  app.factory( 'user', [ function() {

    /* private properties */
    var enterTimes = [];
    var exitTimes = [];

    /* Constructor */
    function User( user ) {

      enterTimes = []; //TODO user.enterTimes;
      exitTimes = []; //TODO user.exitTimes;

      /* public properties */
      this.userId = user.userId || user.id;
      this.visitorCount = user.visitorCount;
      this.active = user.active;

      //TODO 
      this.displayName = user.displayName;
      this.defaultMessage = " is present";
      this.offlineMessage = " is offline";
      this.message = "";

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
