(function() {

  var app = angular.module( 'SearchDirectives', [ 'UserServices' ] );

  app.directive( 'silSearchResult', function() {
    return {
      restrict: 'E',
      scope: {
        index: "@"
      },
      templateUrl: 'templates/sil-search-result.html',
      link: function( scope, element, attrs ) {
        scope.name = "LOL";
      }
    };
  });

})();
