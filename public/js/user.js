(function() {
  var app = angular.module( 'User', [] );

  app.factory( 'user', function() {

    /* Constructor */
    function User( userId, username, visitorCount, guest, active ) {

      /* public properties */
      this.userId = userId;
      this.username = username;
      this.visitorCount = visitorCount;
      this.guest = guest;
      this.active = active;
      this.message = " is present";
    }

    /* private properties */
    var somePrivateProperty = {};

    /* private function */
    function somePrivateFunction() {};

    /* public function */
    User.prototype.somePublicFunction = function() {};

    /* return constructor */
    return User;
  });

})();
