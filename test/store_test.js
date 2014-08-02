var expect    = require('chai').expect;
var Store     = require('../lib/store');
var Immutable = require('immutable');

describe('Store', function() {
  describe('.add', function() {
    it('replaces the entire store when values are added', function() {
      var buckets = Store.buckets;

      Store.add('tags', {id: 1});

      expect(Store.buckets).not.to.eq(buckets);
    });
  });

  describe('.all', function() {
    it('returns all models in the specified bucket', function() {
      Store.add('tags', {id: 1});

      expect(Store.all('tags').length).to.eq(1);
    });
  });

  describe('.find', function() {
    it('returns the requested object by id', function() {
      var object = {id: 1};

      Store.add('tags', object);

      var found = Store.find('tags', 1);

      expect(found).to.eql(object);
    });
  });

  describe('.some', function() {
    it('returns all of the models requested by id', function() {
      Store.add('tags', {id: 1});
      Store.add('tags', {id: 2});

      var found = Store.some('tags', [1, 2]);

      expect(found.length).to.eq(2);
    });

    it('treats the same subset of models as equal', function() {
      Store.add('tags', {id: 1});
      Store.add('tags', {id: 2});

      var foundA = Store.some('tags', [1, 2]);
      var foundB = Store.some('tags', [1, 2]);

      expect(Immutable.is(foundA, foundB)).to.be.true;
    });
  });
});
