var Maybe = function( thing ) {
  this.isPresent = (thing !== null) && (typeof thing !== 'undefined');
  this.value = this.isPresent ? thing : null;
};

Maybe.NOTHING = new Maybe(null);

Maybe.prototype.map = function( fn ) {
  return this.isPresent ? new Maybe( fn( this.value) ) : this;
};

Maybe.prototype.orElse = function( thing ) {
  return this.isPresent ? this.value : thing;
};

Maybe.prototype.bind = function( fn ) {
  if( this.isPresent ) {
    var maybe = fn( this.value );
    if( typeof maybe.isPresent === 'boolean' ) {
      return maybe;
    } else {
      throw new Error('bind must be called with a function that returns Maybe');
    }
  } else {
    return this;
  }
};

module.exports = {
  Maybe: Maybe
};
