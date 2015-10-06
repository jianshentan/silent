var Just = function( thing ) { this.value = thing; };

Just.prototype.isPresent = function() { return true; };

Just.prototype.map = function( fn ) { return new Just( fn( this.value ) ); };

Just.prototype.orElse = function() { return this.value; };

Just.prototype.bind = function( fn ) { return fn( this.value ); };

var Nothing = {};

Nothing.isPresent = function() { return false; };

Nothing.map = function() { return this; };

Nothing.orElse = function( elseThing ) { return elseThing; };

Nothing.bind = function() { return this; };

var ofNullable = function( thing ) {
  if( thing !== null && typeof thing !== 'undefined' ) {
    return new Just(thing);
  } else {
    return Nothing;
  }
};

module.exports = {
  Just: Just,
  Nothing: Nothing,
  ofNullable: ofNullable
};
