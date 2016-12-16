/**
 * Utilities that will be shared by all bots, mostly to manage the details of connecting with Twitter. 
 * @module utils 
 */ 


// npm modules 
const debug   = require('debug')('tb:utils');
const Promise = require('bluebird');
// const co      = require('co');
// const _       = require('lodash');
// const thunkify = require('thunkify');

// internal modules 
const endpoints = require('../config/endpoints');

module.exports = utilities;




/**
 * utilities - This is a constructor function for the utilities
 *  
 * @return {type}  description 
 */ 
function utilities(twitterBot) {
  const self      = twitterBot;
  const options   = twitterBot.options;
  
  const utils = {
    accountInfo: null,
    tweet, 
    verifyCredentials, 
    handleError, 
    // start, 
  };
  return utils;


  function tweet(statusToTweet) {
    debug('tweet');  
    return self.twit.post(endpoints.tweet, {
      status: statusToTweet, 
    });
  }
  
  function verifyCredentials() {
    debug('verifyCredentials');
    self.twit.get(endpoints.get.verifyCredentials)
      .then((res) => {
        utils.accountInfo = res.data;
      })
      .catch(handleError);
  }
  
  function handleError(err) {
    debug('handleError');
    
    
  }
}
