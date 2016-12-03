// npm modules 
const chai         = require('chai');
const EventEmitter = require('events');

// internal modules 
const Unitwit = require('./index');


const expect = chai.expect;


describe('Unitwit', function() {
  describe('constructor function', function() {
    it('should work with valid credentials', function() {
      let testTwit = new Unitwit({
        consumer_key:        'a', 
        consumer_secret:     'b', 
        access_token:        'c',
        access_token_secret: 'd',
      });
      expect(testTwit).to.be.instanceof(Unitwit);
      expect(testTwit.apiStream).to.be.null;
      expect(testTwit.streamEndpoint).to.be.null;
      expect(testTwit.streamParams).to.be.null;
      expect(testTwit.flusher).to.be.instanceof(EventEmitter);
      expect(testTwit.expectations).to.be.instanceof(Array);
      expect(testTwit.requests).to.be.instanceof(Array);
    });
    describe('invalid credentials', function() {
      it('should break without config', function() {
        expect(function() {
          new Unitwit();
        }).to.throw(Error, 'Config must be present for unitwit');
      });
      it('should break without all required keys', function() {
        expect(function() {
          new Unitwit({
            consumer_key:        'a', 
            consumer_secret:     'b', 
            access_token:        'c',
          });
        }).to.throw(Error, 'Unitwit config must include key access_token_secret, and that key must be a string.');
      });
      it('should break if required keys incorrect type', function() {
        expect(function() {
          new Unitwit({
            consumer_key:        'a', 
            consumer_secret:     2, 
            access_token:        'c',
            access_token_secret: 'd', 
          });
        }).to.throw(Error, 'Unitwit config must include key consumer_secret, and that key must be a string.');
      });
    });
  });
  describe('streaming api mock', function() {
    beforeEach('construct testTwit', function() {
      this.testTwit = new Unitwit({
        consumer_key:        'a', 
        consumer_secret:     'b', 
        access_token:        'c',
        access_token_secret: 'd',
      });
    });
    it('should create a mock stream with default streamParams', function() {
      let streamEndpoint = 'user';
      let apiStream = this.testTwit.stream(streamEndpoint);
      expect(apiStream).to.be.instanceof(EventEmitter);
      expect(apiStream).to.equal(this.testTwit.apiStream);
      expect(this.testTwit.streamEndpoint).to.equal(streamEndpoint);
      expect(this.testTwit.streamParams).to.eql({});
    });
    it('should create a mock stream with supplied streamParams', function() {
      let streamParams = {
        track: 'stuff',
      };
      let streamEndpoint = 'user';
      let apiStream = this.testTwit.stream(streamEndpoint, streamParams);
      expect(apiStream).to.be.instanceof(EventEmitter);
      expect(apiStream).to.equal(this.testTwit.apiStream);
      expect(this.testTwit.streamEndpoint).to.equal(streamEndpoint);
      expect(this.testTwit.streamParams).to.eql(streamParams);
    });
    it('should error out without an api endpoint.', function() {
      expect(() => {
        this.testTwit.stream();
      }).to.throw(Error, 'Streaming API endpoint is required.');
    });
  });
  // describe('REST api mock', function() {
  //   
  // });
});
