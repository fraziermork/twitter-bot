/**
 * Utilities that will be shared by all bots, mostly to manage the details of connecting with Twitter. 
 * @module utils 
 */ 

// npm modules 
const debug     = require('debug')('tb:utils');
const _         = require('lodash');

// internal modules 
const endpoints = require('../config/endpoints');
const validator = require('./validator');


/**
 * utils - Collection of utilities for interacting with twitter, the 
 */ 
const utils = {
  tweet, 
  handleError, 
  
  // The twit instance that will be shared by all bots 
  twit:   null,
  stream: null,
  
  _setTwit,
  _setRootBot, 
  _verifyCredentials, 
  
  // Holder for account information that will be populated with GET request to 'account/verify_credentials'
  _accountInfo: {
    pending: false, 
    res:     {},
  },
  
  // The root bot 
  _rootBot: null,
};

module.exports  = utils;


/**
 * tweet - description
 *  
 * @param  {type} statusToTweet description 
 * @param  {type} options       description 
 * @return {type}               description 
 */ 
function tweet(statusToTweet, options = {}) {
  debug('tweet');
  validator.validate.tweetOptions(options);
  return this.twit.post(endpoints.tweet, {
    status: statusToTweet, 
  });
}


/**
 * handleError - description
 *  
 * @param  {type} err description 
 * @return {type}     description 
 */ 
function handleError(err) {
  debug('handleError', err);
  
}


/**
 * _setTwit - Sets a twit instance for utils to use 
 * @private  
 * @param  {object} newTwit An instance of twit or a mock of it 
 * @return {type}         description 
 */ 
function _setTwit(newTwit) {
  debug('setTwit');
  // Should write a stricter check that it implements the Twit interface 
  if (!newTwit || typeof newTwit !== 'object') throw new TypeError('New Twit must be an object');
  utils.twit = newTwit;
  return this;
}

/**
 * _setRootBot - description
 * @private 
 * @param  {TwitterBot} bot - The bot to set as the root bot of the bot tree 
 */ 
function _setRootBot(bot) {
  // Not sure what the best way to do this or whether it is necessary 
  if (!bot._isRoot) throw new Error('twitterBot._isRoot must be true to be the root bot.');
  utils._rootBot = bot;
  return this;
}


/**
 * _verifyCredentials - Populates utils._accountInfo.res with the results of GET request to 'account/verify_credentials'
 * @private 
 * @return {promise}  - A promise that resolves once it successfully makes a request 
 */ 
function _verifyCredentials() {
  debug('verifyCredentials');
  if (utils._accountInfo.pending) return;
  
  utils._accountInfo.pending = true;
  return utils.twit.get(endpoints.get.verifyCredentials)
    .then((res) => {
      debug('got account info');
      _.assign(utils._accountInfo.res, res.data);
      return res.data;
    })
    .catch(handleError)
    .finally(() => {
      utils._accountInfo.pending = false;
    });
}
