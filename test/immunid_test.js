var expect    = require('chai').expect;
var sinon     = require('sinon');
var Store     = require('../immunid');
var Immutable = require('immutable');

describe('Immunid', function() {
  var store;

  beforeEach(function() {
    store = new Store();
  });

  describe('#add', function() {
    it('replaces the entire store when values are added', function() {
      var buckets = store.buckets;

      store.add('tags', {id: 1});

      expect(Immutable.is(buckets, store.buckets)).to.be.false;
    });

    it('broadcasts a change event to registered listeners', function() {
      var listener = sinon.spy();

      store.addChangeListener(listener);

      store.add('tags', {id: 1});

      expect(listener.called).to.be.true;
    });
  });

  describe('#delete', function() {
    it('removes an existing model from the bucket', function() {
      store.add('tags', { id: 1 });

      var buckets = store.buckets;

      store.delete('tags', 1);

      expect(store.find('tags', 1)).to.be.undefined;
      expect(Immutable.is(buckets, store.buckets)).to.be.false;
    });

    it('broadcasts a change event', function() {
      var listener = sinon.spy();

      store.add('tags', { id: 1 });

      store.addChangeListener(listener);

      store.delete('tags', 1);

      expect(listener.calledOnce).to.be.true;
    });
  });

  describe('#all', function() {
    it('returns all models in the specified bucket', function() {
      store.add('tags', {id: 1});

      expect(store.count('tags')).to.eq(1);
    });
  });

  describe('#find', function() {
    it('returns the requested object by id', function() {
      var object = {id: 1};

      store.add('tags', object);

      var found = store.find('tags', 1);

      expect(found).to.eql(object);
    });
  });

  describe('#some', function() {
    it('returns all of the models requested by id', function() {
      store.add('tags', {id: 1});
      store.add('tags', {id: 2});

      var found = store.some('tags', [1, 2]);

      expect(found.length).to.eq(2);
    });

    it('treats the same subset of models as equal', function() {
      store.add('tags', {id: 1}).add('tags', {id: 2});

      var foundA = store.some('tags', [1, 2]);
      var foundB = store.some('tags', [1, 2]);

      expect(Immutable.is(foundA, foundB)).to.be.true;
    });
  });

  describe('#parse', function() {
    var payload = {
      authors:  [{ id: 1 }],
      comments: [{ id: 1 }, { id: 2 }],
      posts:    [{ id: 1 }, { id: 2 }]
    }

    it('extracts a payload of rooted arrays into corresponding buckets', function() {
      store.parse(payload);

      expect(store.count('authors')).to.eq(1);
      expect(store.count('comments')).to.eq(2);
      expect(store.count('posts')).to.eq(2);
    });

    it('emits a single change event after parsing', function() {
      var listener = sinon.spy();

      store.addChangeListener(listener);
      store.parse(payload);

      expect(listener.callCount).to.eq(1);
    });
  });
});
