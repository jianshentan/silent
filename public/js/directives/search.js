(function() {

  var app = angular.module( 'SearchDirectives', [ 'UserServices' ] );

  app.directive( 'silSearchResult', function() {
    return {
      restrict: 'E',
      scope: {
        index: "@",
        room: "=",
        card: "="
      },
      templateUrl: 'templates/sil-search-result.html',
      link: function( scope, element, attrs ) {
      }
    };
  });

  app.directive( 'silSearchEmpty', function() {
    return {
      restrict: 'E',
      scope: {
      },
      templateUrl: 'templates/sil-search-empty.html',
      link: function( scope, element, attrs ) {
      }
    };
  });

})();
