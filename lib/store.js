var Immutable = require('immutable');

Store = {
  buckets: Immutable.Map(),

  add: function(namespace, object) {
    var bucket = Store.buckets.get(namespace);

    if (!bucket) bucket = Immutable.Map();

    bucket = bucket.set(object.id, object);

    Store.buckets = Store.buckets.set(namespace, bucket);
  },

  all: function(namespace) {
    return Store.buckets.get(namespace).toVector();
  },

  find: function(namespace, id) {
    var bucket = Store.buckets.get(namespace);

    return bucket.get(id);
  },

  some: function(namespace, ids) {
    var bucket = Store.buckets.get(namespace);
    var vector = Immutable.Vector();

    return vector.withMutations(function(vect) {
      ids.forEach(function(id) {
        vect.push(bucket.get(id));
      });
    });
  }
};

module.exports = Store;
