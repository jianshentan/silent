(function() {
  
  var app = angular.module( 'HomeServices', [] );

  app.factory( 'search',
      [ '$http', function( $http ) {

    /* queries for search results */
    function search( query, success, fail, finish ) {
      return $http.get( '/search?q=' + query )
        .success( function( data ) {
          if( success ) {
            success( data );
          } 
        })
        .error( function( data, status ) {
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

    return {
      search: search
    }
  }]);

})();
