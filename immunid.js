var EventEmitter = require('events').EventEmitter;
var Immutable    = require('immutable');
var merge        = require('./lib/merge');

var CHANGE_EVENT = 'change';

var Store = function() {
  this.buckets = Immutable.Map();
};

merge(Store.prototype, EventEmitter.prototype, {
  /**
   * Register a change listener.
   */
  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  /**
   * Remove a change listener.
   */
  remChangeListener: function(callback) {
    this.off(CHANGE_EVENT, callback);
  },

  /**
   * Returns a vector of every object within the namespace.
   */
  all: function(namespace) {
    return this.buckets.get(namespace).toVector();
  },

  /**
   * Adds an object into the namespace provided. It expects that the object
   * has an `id` property which will be used for direct lookup and uniqueness
   * detection.
   *
   *     var store = new Store();
   *     store.add('tags', { id: 1, name: 'alpha' });
   *
   */
  add: function(namespace, object) {
    var bucket = this.buckets.get(namespace) || Immutable.Map();

    bucket = bucket.set(object.id, object);

    this.emit(CHANGE_EVENT);

    this.buckets = this.buckets.set(namespace, bucket);

    return this;
  },

  /**
   * Updates an object within the specified bucket. As all collections are
   * immutable this is really just an alias for `add`.
   *
   *     var store = new Store();
   *     store.add('tags', { id: 1, name: 'alpha' });
   *     store.set('tags', { id: 1, name: 'omega' });
   *     store.find('tags', 1); // { id: 1, name: 'omega' }
   *
   */
  set: function(namespace, object) {
    this.add(namespace, object);
  },

  /**
   * Remove an object by bucket and id.
   *
   */
  delete: function(namespace, id) {
    var bucket = this.buckets.get(namespace);

    bucket = bucket.delete(id);

    this.emit(CHANGE_EVENT);

    this.buckets = this.buckets.set(namespace, bucket);

    return this;
  },

  /**
   * Returns the number of objects within a namespace
   *
   *    var store = new Store();
   *    store
   *      .add('tags', { id: 1, name: 'alpha' });
   *      .add('tags', { id: 2, name: 'beta' });
   *    store.count('tags'); // 2
   *
   */
  count: function(namespace) {
    return this.buckets.get(namespace).length;
  },

  /**
   * Returns an object stored within the namespace with the specified id.
   *
   *     var store = new Store();
   *     store.add('tags', { id: 1, name: 'alpha' });
   *     store.find('tags', 1); // { id: 1, name: 'alpha' }
   *
   */
  find: function(namespace, id) {
    var bucket = this.buckets.get(namespace);

    return bucket.get(id);
  },

  /**
   * Returns a vector of objects within the namespace and having the
   * requested ids.
   *
   *    var store = new Store();
   *    store
   *      .add('tags', { id: 1, name: 'alpha' });
   *      .add('tags', { id: 2, name: 'beta' });
   *    store.some('tags', [1, 2]);
   */
  some: function(namespace, ids) {
    var bucket = this.buckets.get(namespace);
    var vector = Immutable.Vector();

    return vector.withMutations(function(vect) {
      ids.forEach(function(id) {
        vect.push(bucket.get(id));
      });
    });
  },

  /**
   * Loads all objects from arrays nested within a payload.
   *
   *
   *    store.parse({
   *      authors:  [{ id: 1 }],
   *      comments: [{ id: 1 }, { id: 2 }],
   *      posts:    [{ id: 1 }, { id: 2 }]
   *    });
   *    store.count('authors'); // 1
   *    store.count('comments'); // 2
   *    store.count('posts'); // 2
   *
   */
  parse: function(payload) {
    var bucket, objects;

    var applyMutations = function(map) {
      payload[namespace].forEach(function(object) {
        map.set(object.id, object);
      });
    };

    for (var namespace in payload) {
      bucket = this.buckets.get(namespace) || Immutable.Map();

      bucket = bucket.withMutations(applyMutations);

      this.buckets = this.buckets.set(namespace, bucket);
    }

    this.emit(CHANGE_EVENT);

    return this;
  }
});

module.exports = Store;
