// npm modules 
const chai         = require('chai');
const EventEmitter = require('events');
const Promise      = require('bluebird');

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
    describe('errors on invalid credentials', function() {
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
    describe('mock streaming events', function() {
      beforeEach('initiate the stream', function() {
        this.testTwit.stream('user', { track: 'stuff' });
      });
      it('should be able to mock stream events', function(done) {
        let eventName = 'fubar';
        let eventData = { foo: 'bar' };
        this.testTwit.apiStream.once(eventName, (data) => {
          expect(data).to.eql(eventData);
          done();
        });
        this.testTwit.mockStreamEvent(eventName, eventData);
      });
    });
  });
  
  
  describe('REST api mock', function() {
    beforeEach('construct testTwit', function() {
      this.testTwit = new Unitwit({
        consumer_key:        'a', 
        consumer_secret:     'b', 
        access_token:        'c',
        access_token_secret: 'd',
      });
    });
    describe('Unitwit.prototype.verifyExpectationsMet', function() {
      it('should throw an error if there is an unmet expectation.', function() {
        this.testTwit.expectations.push({ foo: 'bar' });
        expect(() => {
          this.testTwit.verifyExpectationsMet();
        }).to.throw(Error, 'Unmet expectations: 1, unexpected requests: 0.');
      });
      it('should throw an error if there was an unexpected request.', function() {
        this.testTwit.requests.push({ foo: 'bar' });
        expect(() => {
          this.testTwit.verifyExpectationsMet();
        }).to.throw(Error, 'Unmet expectations: 0, unexpected requests: 1.');
      });
    });
    describe('Unitwit.prototype.expect', function() {
      it('should add an expectation', function() {
        let expectedExpectation = {
          method:   'foo', 
          endpoint: 'bar', 
          response: 'hello', 
          params:   'world', 
        };
        this.testTwit.expect(expectedExpectation.method, expectedExpectation.endpoint, expectedExpectation.response, expectedExpectation.params);
        expect(this.testTwit.expectations.length).to.equal(1);
        expect(this.testTwit.expectations[0]).to.eql(expectedExpectation);
      });
    });
    describe('Unitwit.prototype.flush', function() {
      it('should emit the flush event', function(done) {
        this.testTwit.flusher.once('flush', done);
        this.testTwit.flush();
      });
    });
    describe('Unitwit.prototype.request', function() {
      // afterEach('verify expectations met', function() {
      //   this.testTwit.verifyExpectationsMet();
      // });
      it('should respond to an expected request with the response set by Unitwit.prototype.expect', function(done) {
        let method   = 'GET';
        let endpoint = 'fubar';
        let params   = { track: 'stuff' };
        let response = { foo: 'bar' };
        this.testTwit.expect(method, endpoint, response, params);
        this.testTwit.request(method, endpoint, params);
        
        this.testTwit.flusher.once('flush', () => {
          this.testTwit.verifyExpectationsMet();
          done();
        });
        this.testTwit.flush();
      });
      describe('errors', function() {
        it('should throw exception if the request was not expected');
        it('should throw exception if a different request was expected');
        it('should throw exception if the params did not match');
        it('should throw exception if that was the type of response set by Unitwit.prototype.expect', function(done) {
          let method   = 'GET';
          let endpoint = 'fubar';
          let params   = { track: 'stuff' };
          let response = new Error('SNAFU');
          this.testTwit.expect(method, endpoint, response, params);
          this.testTwit.request(method, endpoint, params);
          this.testTwit.flusher.once('flush', () => {
            this.testTwit.verifyExpectationsMet();
          });
          expect(() => {
            this.testTwit.flush();
          }).to.throw(response);
          done();
          
          
        });
      });
    });
    
  });
});
