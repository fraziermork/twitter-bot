/** @module Unitwit */
// A mock for the twit module 

const EventEmitter = require('events');
const Promise      = require('bluebird');
const debug        = require('debug')('tb:Unitwit');

module.exports     = Unitwit;

/**  
 * Unitwit - description  
 * @constructor   
 * @param  {Object} config An object with the required API keys   
 */   
function Unitwit(config) {
  debug('Unitwit', config);
  this.validateConfig(config);
  this.expectations   = [];
  this.requests       = [];
  this.flusher        = new EventEmitter();
  this.stream         = null;
  this.streamEndpoint = null;
  this.streamParams   = null;
}

// Methods that implement the same interface as the real twit 
Unitwit.prototype.get                   = get;
Unitwit.prototype.post                  = post;
Unitwit.prototype.request               = request;
Unitwit.prototype.stream                = stream;
Unitwit.prototype.validateConfig        = validateConfig;

// Unitwit only methods 
Unitwit.prototype.expect                = expect;
Unitwit.prototype.flush                 = flush;
Unitwit.prototype.verifyExpectationsMet = verifyExpectationsMet;
Unitwit.prototype.mockTweet             = mockTweet;  
Unitwit.prototype.mockStreamEvent       = mockStreamEvent;






/*
███    ███  ██████   ██████ ██   ██     ████████ ██     ██ ██ ████████     ███    ███ ███████ ████████ ██   ██  ██████  ██████  ███████
████  ████ ██    ██ ██      ██  ██         ██    ██     ██ ██    ██        ████  ████ ██         ██    ██   ██ ██    ██ ██   ██ ██
██ ████ ██ ██    ██ ██      █████          ██    ██  █  ██ ██    ██        ██ ████ ██ █████      ██    ███████ ██    ██ ██   ██ ███████
██  ██  ██ ██    ██ ██      ██  ██         ██    ██ ███ ██ ██    ██        ██  ██  ██ ██         ██    ██   ██ ██    ██ ██   ██      ██
██      ██  ██████   ██████ ██   ██        ██     ███ ███  ██    ██        ██      ██ ███████    ██    ██   ██  ██████  ██████  ███████
*/



/**  
 * get - Syntactic sugar for request. 
 *    
 * @param  {type} ...args description   
 * @return {type}         description   
 */   
function get(...args) {
  return this.request.call(this, 'GET', ...args);
}



/**  
 * post - Syntactic sugar for request. 
 *    
 * @param  {type} ...args description   
 * @return {type}         description   
 */   
function post(...args) {
  return this.request.call(this, 'POST', ...args);
}




/**  
 * request - Fakes a request to twitter. 
 * 
 *    
 * @param  {string} method   The http method to use   
 * @param  {string} endpoint The twitter endpoint to hit   
 * @param  {object} [params] An object defining the request options 
 * @param  {function} [callback] An optional callback.   
 * @return {Promise}         A promise that rejects with an error if params didn't match, or resolves/rejects depending on how expect method told it to.   
 */   
function request(method, endpoint, params = {}, callback) {
  debug(`${method} request made to ${endpoint}.`);
  this.flusher.on('flush', () => {
    debug(`Responding to ${method} request to ${endpoint}.`);
    for (let i = 0; i < this.expectations.length; i++) {
      let currentExpectation = this.expectations[i];
      
      // Event emitters fire callbacks in the order they are registered, so the first match found is the correct match
      if (currentExpectation.method === method && currentExpectation.endpoint === endpoint) {
        let response = currentExpectation.response;
        return new Promise((resolve, reject) => {
          
          // If the request and expectation params didn't match, throw error 
          let paramKeys = Object.keys(params);
          for (let j = 0; j < paramKeys.length; j++) {
            let key = paramKeys[j];
            if (params[key] !== currentExpectation.params[key]) {
              let mismatch = new Error(`Parameter ${key} didn't match on request (${params[key]}) and expectation (${currentExpectation.params[key]}).`);
              callback && callback(mismatch);
              throw mismatch;
            }
          }
          
          // If it's supposed to respond with an error, do so 
          if (response instanceof Error) {
            callback && callback(response);
            return reject(response);
          }
          
          // Everything is cool 
          callback && callback(null, response);
          return resolve(response);
        });
      }
    }
    
    // No match was found, pushing into requests array for reference 
    // TODO: figure out a less clunky way to pass on info about unexpected request  
    this.requests.push({
      method, 
      endpoint, 
      params, 
      callback,
    });
  });
}


function stream(endpoint, params) {
  debug(`Stream initiated to ${endpoint} endpoint.`, params);
  this.stream         = new EventEmitter();
  this.streamEndpoint = endpoint;
  this.streamParams   = params;
  return this.stream;
}


/**
* validateConfig - Does quick validation to ensure required keys are present
*  
* @param  {Object} config description 
*/ 
function validateConfig(config) {
  if (!config) throw new Error('Config must be present for unitwit');
  if (typeof config !== 'object') throw new TypeError(`config must be ojbect, got ${typeof config}`);
  
  const requiredKeys = [
    'consumer_key',
    'consumer_secret',
    'access_token',
    'access_token_secret',
  ];
  requiredKeys.forEach((key) => {
    if (!config[key]) {
      throw new Error(`Unitwit config must include key ${key}.`);
    } 
  });
}




/*
██    ██ ███    ██ ██ ████████ ██     ██ ██ ████████      ██████  ███    ██ ██   ██    ██     ███    ███ ███████ ████████ ██   ██  ██████  ██████  ███████
██    ██ ████   ██ ██    ██    ██     ██ ██    ██        ██    ██ ████   ██ ██    ██  ██      ████  ████ ██         ██    ██   ██ ██    ██ ██   ██ ██
██    ██ ██ ██  ██ ██    ██    ██  █  ██ ██    ██        ██    ██ ██ ██  ██ ██     ████       ██ ████ ██ █████      ██    ███████ ██    ██ ██   ██ ███████
██    ██ ██  ██ ██ ██    ██    ██ ███ ██ ██    ██        ██    ██ ██  ██ ██ ██      ██        ██  ██  ██ ██         ██    ██   ██ ██    ██ ██   ██      ██
 ██████  ██   ████ ██    ██     ███ ███  ██    ██         ██████  ██   ████ ███████ ██        ██      ██ ███████    ██    ██   ██  ██████  ██████  ███████
*/



/**  
 * expect - Define a request that is expected and how to respond to it. Chainable. 
 *    
 * @param  {string} method   The http method of the expected request    
 * @param  {string} endpoint The api endpoint the request is expected to hit  
 * @param  {*}      response How to respond   
 * @param  {object} params   description   
 * @return {Unitwit}         Returns 'this' for chainability.   
 */   
function expect(method, endpoint, response, params) {
  debug(`Expect ${method} to ${endpoint}.`);
  this.expectations.push({
    method, 
    endpoint, 
    response, 
    params, 
  });
  return this;
}


/**  
 * flush - Respond to each expected request. Chainable. 
 * 
 * @return {Unitwit} Returns 'this' for chainability.   
 */   
function flush() {
  debug('flush');
  this.flusher.emit('flush');
  return this;
}



/**  
 * verifyExpectationsMet - Checks to make sure there are no outstanding expectations or requests. 
 * Thows an error if an unexpected request was made or if an expected request was not made. Chainable for no real reason.
 * 
 * @return {Unitwit} Returns 'this' for chainability.     
 */   
function verifyExpectationsMet() {
  debug('verifyExpectationsMet');
  if (this.expectations.length || this.requests.length) {
    throw new Error(`Unmet expectations: ${this.expectations.length}, unexpected requests: ${this.requests.length}.`);
  } 
  debug('All expectations met.');
  this.flusher.removeAllListeners('flush');
  return this;
}



/**
 * mockTweet - Fakes an incoming tweet from the stream 
 *  
 * @param  {object} tweet Mocked tweet object 
 * @return {Unitwit}      Returns 'this' for chainability.
 */ 
function mockTweet(tweet) {
  return this.mockStreamEvent('tweet', tweet);
}




/**
 * mockStreamEvent - Fakes an incoming 
 *  
 * @param  {string} eventName description 
 * @param  {*} data           Mocked event data (like a tweet object) 
 * @return {Unitwit}          Returns 'this' for chainability. 
 */ 
function mockStreamEvent(eventName, data) {
  debug(`Mocking an ${eventName} event.`, data);
  if (!this.stream) throw new Error('Unitwit stream not yet initiated.');
  this.stream.emit(eventName, data);
  return this;
}
