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
  });

})();
