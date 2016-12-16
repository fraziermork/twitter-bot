/**
 * Utilities that will be shared by all bots, mostly to manage the details of connecting with Twitter. 
 * @module utils 
 */ 


// npm modules 
const debug   = require('debug')('tb:utils');
const _       = require('lodash');

// internal modules 
const endpoints = require('../config/endpoints');

module.exports = utilities;




/**
 * utilities - This is a constructor function for the utilities
 *  
 * @return {type}  description 
 */ 
function utilities(bot) {
  
  
  
  const utils = {
    tweet, 
    verifyCredentials, 
    handleError, 
    
    // Holder for account information that will be populated with GET request to 'account/verify_credentials'
    accountInfo: {
      pending: false, 
    },
  };
  return utils;


  function tweet(statusToTweet) {
    debug('tweet');  
    return bot.twit.post(endpoints.tweet, {
      status: statusToTweet, 
    });
  }
  
  function verifyCredentials() {
    debug('verifyCredentials');
    if (utils.accountInfo.pending) return;
    
    utils.accountInfo.pending = true;
    return bot.twit.get(endpoints.get.verifyCredentials)
      .then((res) => {
        debug('got account info');
        _.assign(utils.accountInfo, res.data);
      })
      .catch(handleError)
      .finally(() => {
        utils.accountInfo.pending = false;
      });
  }
  
  function handleError(err) {
    debug('handleError', err);
    
    
  }
}
