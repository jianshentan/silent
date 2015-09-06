(function() {

  /* TabDirectives []: 
     'silJoinTab' --> join tab 
     'silUserTab' --> other user tab 
  */
  var app = angular.module( 'TabDirectives', []);

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
