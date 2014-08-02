var EventEmitter = require('events').EventEmitter;
var Immutable = require('immutable');
var merge     = require('./merge');

var CHANGE_EVENT = 'change';

var Store = function() {
  this.buckets = Immutable.Map();
};

merge(Store.prototype, EventEmitter.prototype, {
  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  remChangeListener: function(callback) {
    this.off(CHANGE_EVENT, callback);
  },

  all: function(namespace) {
    return this.buckets.get(namespace).toVector();
  },

  add: function(namespace, object) {
    var bucket = this.buckets.get(namespace);

    if (!bucket) bucket = Immutable.Map();

    bucket = bucket.set(object.id, object);

    this.emit(CHANGE_EVENT);

    this.buckets = this.buckets.set(namespace, bucket);

    return this;
  },

  set: function(namespace, object) {
    this.add(namespace, object);
  },

  delete: function(namespace, id) {
    var bucket = this.buckets.get(namespace);

    bucket = bucket.delete(id);

    this.emit(CHANGE_EVENT);

    this.buckets = this.buckets.set(namespace, bucket);

    return this;
  },

  find: function(namespace, id) {
    var bucket = this.buckets.get(namespace);

    return bucket.get(id);
  },

  some: function(namespace, ids) {
    var bucket = this.buckets.get(namespace);
    var vector = Immutable.Vector();

    return vector.withMutations(function(vect) {
      ids.forEach(function(id) {
        vect.push(bucket.get(id));
      });
    });
  }
});

module.exports = Store;
