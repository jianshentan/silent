(function() {
  var app = angular.module( 'User', [] );

  app.factory( 'user', function() {

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
    }

    /* private function */
    function somePrivateFunction() {};

    /* public function */
    User.prototype.getActiveDuration = function() {
      if( enterTimes.length - exitTimes.length == 1 ) {
        var accumulator = 0;
        for( var i in exitTimes ) {
          accumulator += enterTimes[i] - exitTimes[i]; 
        }
        return accumulator;
      } else {
        console.log( "enterTimes and exitTimes do not match up" );
        return 'unavailable';
      }
      
    };

    /* return constructor */
    return User;
  });

})();
