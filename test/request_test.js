var expect = require('chai').expect;
var sinon  = require('sinon');
var Request = require('../lib/request');

describe('Request', function() {
  describe('#set', function() {
    it('updates the header object', function() {
      var request = new Request('get', '/');

      request.set('Accept', 'application/json');

      expect(request.header).to.have.key('Accept');
    });
  });

  describe('#send', function() {
    it('merges the object into data', function() {
      var request = new Request('post', '/');

      request.send({ id: 100, name: 'Hello' });

      expect(request.data).to.eql({ id: 100, name: 'Hello' });

      request.send({ type: 'thing' });

      expect(request.data).to.include({ type: 'thing' });
    });
  });

  describe('#isXDomainRequest', function() {
    it('is a cross domain request when the hostname does not match', function() {
      var request = new Request('get', 'https://example.com/stuff');

      expect(request.isXDomainRequest('localhost:8080')).to.be.true;
      expect(request.isXDomainRequest('example.com')).to.be.false;
    });
  });
});
