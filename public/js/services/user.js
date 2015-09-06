(function() {

  /* UserServices includes: 
     'auth' --> manages authentication 
     'user' --> user class
  */
  var app = angular.module( 'UserServices', [ 'UtilServices' ] );

  /* Authentication */
  app.factory( 'auth', 
      [ '$http', '$rootScope', 'tokenManager', 'user', 
      function( $http, $rootScope, tokenManager, user ) {

    var currentUser; // type: User object
    /* currently, currentUser is updated via Sockets - onenter event */

    // param:cb is optional
    function login( username, password, cb ) {
      return $http.post( '/login', { username: username, password: password } )
        .success( function( data ) {
          // if login is successful, store token
          var token = data.token;
          tokenManager.storeUserCredentials( token );
          
          // TODO get user info and put into User module

        })
        .error( function( data, status ) {
          // Erase the token if the user fails to log in
          tokenManager.destroyUserCredentials();

          // Handle error
          var message = data.message;
          console.log( "ERR: " + message );
        })
        .finally( function() {
          if( cb ) {
            cb();
          }
        });
    };

    // param:cb is optional
    function signup( username, password, cb ) {
      return $http.post( '/signup', { username: username, password: password } )
        .success( function( data ) {
          // if signup is successful, store token
          var token = data.token;
          tokenManager.storeUserCredentials( token );

          // TODO get user info and put into User module

        })
        .error( function( data, status ) {
          // Erase the token if the user fails to sign up 
          tokenManager.destroyUserCredentials();

          // Handle error
          var message = data.message;
          console.log( "ERR: " + message );
        })
        .finally( function() {
          if( cb ) {
            cb();
          }
        });
    };

    // param:cb is optional
    function logout( cb ) {
      tokenManager.destroyUserCredentials();
      if( cb ) {
        cb();
      }
    };

    function isAuthenticated() {
      return tokenManager.isAuthenticated();
    };

    // param:cb is optional
    function getUser( cb ) {
      if( cb ) {
        cb( currentUser );
      } else {
        return currentUser;
      }
    };

    // param:cb is optional
    function setUser( data, cb ) {
      currentUser = new user( data );
      $rootScope.$emit( 'userUpdate', {} );
      if( cb ) {
        cb();
      }
    };

    return {
      login: login,
      signup: signup,
      logout: logout,
      isAuthenticated: isAuthenticated,
      getUser: getUser,
      setUser: setUser
    }    
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
      this.username = user.username;
      this.visitorCount = user.visitorCount;
      this.guest = user.guest;
      this.active = user.active;

      this.message = " is present";

      /* this.time is used for 'am-time-ago' which updates active 
         state duration in real time */
      this.time = new Date( Date.now() - this.getActiveDuration() );
    }

    /* private functions */
    function somePrivateFunction() {};

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
