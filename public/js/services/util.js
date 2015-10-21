(function() {

  var app = angular.module( 'UtilServices', [] );

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

  /* Token Manager */
  app.factory( 'tokenManager', [ '$window', '$http', function( $window, $http ) {

    var LOCAL_TOKEN_KEY = "user_token";
    var hasToken = false;
    var authToken;

    function getToken( cb ) {
      var token = $window.localStorage.getItem( LOCAL_TOKEN_KEY );
      if( token ) {
        cb( null, token );
      } else {
        cb( 'No Token' );
      }
    }

    function loadUserCredentials( cb ) {
      var token = $window.localStorage.getItem( LOCAL_TOKEN_KEY );
      if( token ) {
        hasToken = true;
        useUserCredentials( token, cb );
      } else {
        cb( null );
      }
    }

    function storeUserCredentials( token ) {
      $window.localStorage.setItem( LOCAL_TOKEN_KEY, token );
      useUserCredentials( token );
    }

    function useUserCredentials( token, cb ) {
      authToken = token;

      // Set the token as header for your requests
      $http.defaults.headers.common.Authorization = "Bearer " + token; 

      if( cb ) {
        cb();
      }
    }

    function destroyUserCredentials() {
      authToken = undefined;
      hasToken = false;
      $http.defaults.headers.common.Authorization = undefined;
      window.localStorage.removeItem( LOCAL_TOKEN_KEY );
    }

    return {
      getToken: getToken,
      loadUserCredentials: loadUserCredentials,
      storeUserCredentials: storeUserCredentials,
      useUserCredentials: useUserCredentials,
      destroyUserCredentials: destroyUserCredentials,
      hasToken: function() { return hasToken; }
    };

  }]);

  /* Sockets */
  app.factory( 'socket', [ 'tokenManager', '$rootScope', function( tokenManager, $rootScope ) {
    var socket = io.connect();

    tokenManager.getToken( function( err, token ) {
      console.log( 'Authenticating with: ' + token );

      socket.on( 'connect', function() {
        if( token ) {
          socket.emit( 'join', {
            token: token
          }); //send the jwt
        } else {
          socket.emit( 'guest' );
        }
      });
    });
                      
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
})();
