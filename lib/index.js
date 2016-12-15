/** @module TwitterBot */

// npm modules 
const debug    = require('debug')('tb:TwitterBot');

// internal modules 
const utils    = require('./utils');
const validate = require('../validate');

module.exports = configureTwitterBot;

/**
 * configureTwitterBot - Wrapper around the TwitterBot constructor that configures the TwitterBot constructor 
 *  
 * @param    {object} apiKeys         - The twitter api keys that the bot will use 
 * @param    {object} configOptions   - Options to change how the TwitterBot is configured 
 * @property {function} options.Twit  - Allows a custom constructor to be used in place of the twit library for testing purposes
 * @return   {TwitterBot}             - The TwitterBot constructor function  
 */ 
function configureTwitterBot(apiKeys, configOptions = {}) {
  debug('configureTwitterBot');
  
  // Ensure api keys provided 
  if (!apiKeys) throw new Error('Config with API keys is required.');
  
  // Validate configOptions against schema and set defaults 
  validate.configureOptions(configOptions);
  
  // The twit instance that will manage all interactions with twitter 
  const twit          = new configOptions.Twit(apiKeys);
  
  // Holder for account information that will be populated with GET request to 'account/verify_credentials'
  let accountInfo     = null;
  
  
  /**  
   * TwitterBot - Constructor function for bots 
   * @constructor
   * @param  {object} [options] - Options the configure this instance of TwitterBot and set the defaults for its children, if any 
   * @return {TwitterBot}
   */   
  function TwitterBot(options = {}) {
    if (!(this instanceof TwitterBot)) return new TwitterBot(options);
    
    // Validate the supplied options and set defaults 
    validate.twitterBotOptions(options);
    
    // Attach options
    this.options = options;
    
    // Attach twit instance for use 
    this.twit    = twit;
    
    // Attach utilities 
    // TODO: Refactor this to be less clumsy 
    this.utils   = utils(this);
    
    // Container for child TwitterBots
    this.bots    = [];
    
    // Rules required to match with this bot, if any 
    this.rules   = options.rules || [];
  
    // This is set to true if the constructor function is used
    // but gets set to false if they use the factory 
    // TODO: if they pass an instance of TwitterBot to .use, set this value to false 
    this._isRoot = true; 
    if (typeof this.options._isRoot !== 'undefined') {
      this.isRoot = this.options._isRoot;
    }
    
    
  
  }
  
  
  TwitterBot.prototype.start          = start;
  TwitterBot.prototype.getAccountInfo = getAccountInfo;
  
  return TwitterBot;
  
  
  
  function start() {
    debug('start');
  }
  
  function getAccountInfo() {
    debug('getAccountInfo');
  }
  
  
}
