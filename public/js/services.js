(function() {

  var app = angular.module( 'Services', [] );

  /* Token Manager */
  app.factory( 'tokenManager', [ '$window', '$http', function( $window, $http ) {

    var LOCAL_TOKEN_KEY = "user_token";
    var isAuthenticated = false;
    var authToken;

    // call in the beginning to check if client has a token
    loadUserCredentials();

    function loadUserCredentials() {
      var token = $window.localStorage.getItem( LOCAL_TOKEN_KEY );
      if( token ) {
        useUserCredentials( token );
      }
    };

    function storeUserCredentials( token ) {
      $window.localStorage.setItem( LOCAL_TOKEN_KEY, token );
      useUserCredentials( token );
    };

    function useUserCredentials( token ) {
      isAuthenticated = true;
      authToken = token;

      // Set the token as header for your requests
      $http.defaults.headers.common['X-Auth-Token'] = token; 
    };

    function destroyUserCredentials() {
      authToken = undefined;
      isAuthenticated = false;
      $http.defaults.headers.common['X-Auth-Token'] = undefined;
      window.localStorage.removeItem(LOCAL_TOKEN_KEY);
    };

    return {
      loadUserCredentials: loadUserCredentials,
      storeUserCredentials: storeUserCredentials,
      useUserCredentials: useUserCredentials,
      destroyUserCredentials: destroyUserCredentials,
      isAuthenticated: function() { return isAuthenticated; }
    }

  }]);

  /* Authentication */
  app.factory( 'auth', [ '$http', 'tokenManager', function( $http, tokenManager ) {

    // param:cb is optional
    function login( username, password, cb ) {
      return $http.post( '/login', { username: username, password: password } )
        .success( function( data ) {
          // if login is successful, store token
          var token = data.token;
          tokenManager.storeUserCredentials( token );
        })
        .error( function( data, status ) {
          // Erase the token if the user fails to log in
          tokenManager.destroyCredentials();

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
        })
        .error( function( data, status ) {
          // Erase the token if the user fails to sign up 
          tokenManager.destroyCredentials();

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
      tokenManager.destoryCredentials();
      if( cb ) {
        cb();
      }
    };

    // param:cb is optional
    function isAuthenticated( cb ) {
      return tokenManager.isAuthenticated();
    };

    return {
      login: login,
      signup: signup,
      logout: logout,
      isAuthenticated: isAuthenticated
    }    
  }]);

  /* Sockets */
  app.factory( 'socket', [ '$rootScope', function( $rootScope ) {
    var socket = io.connect();
    console.log( "socket connected" );
 
    return {
      on: function( eventName, callback ) {
        function wrapper() {
          var args = arguments;
          $rootScope.$apply( function() {
            callback.apply( socket, args );
          });
        }
 
        socket.on( eventName, wrapper );
 
        return function() {
          socket.removeListener( eventName, wrapper );
        };
      },
      emit: function( eventName, data, callback ) {
        socket.emit( eventName, data, function() {
          var args = arguments;
          $rootScope.$apply( function() {
            if( callback ) {
              callback.apply( socket, args );
            }
          });
        });
      }
    };

  }]);

  /* Authentication Inceptor - 
     the interceptor will notice response errors on $http requests 
     and will catch invalid tokens */
  app.factory( 'authInterceptor', [ '$q', function( $q ) {
    return {
      responseError: function( rejection ) {
        if( rejection.status === 401 || rejection.status === 403 ) {
          // TODO handle the case where the user is not authenticated
          // due to invalid token or missing token
          console.log( "Token may be invalid" );
        }
        return $q.reject( rejection ) || rejection;
      }
    };
  }]);

  /* Config */
  app.config( [ '$httpProvider', '$locationProvider', function( $httpProvider, $locationProvider ) {
    $httpProvider.interceptors.push( 'authInterceptor' );
    /*
    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    });
    */
  }]);

})();
