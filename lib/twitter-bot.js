/** 
* Twitter Bot 
* @module twitter-bot 
*/


// npm modules 
const debug             = require('debug')('tb:TwitterBot');

// internal modules 
const utils             = require('./utils');
const constructValidate = require('../validate');

module.exports          = configureTwitterBot;

/**
 * configureTwitterBot - Wrapper around the TwitterBot constructor that configures the TwitterBot constructor 
 *  
 * @param  {object}   apiKeys                         - The twitter api keys that the bot will use 
 * @param  {object}   [configOptions]                 - Options to change how the TwitterBot is configured 
 * @prop   {object}   configOptions.validatorOptions  - Options to be passed to validate to overwrite the defaults 
 * @prop   {function} options.Twit                    - Allows a custom constructor to be used in place of the twit library for testing purposes
 * @return {TwitterBot}                               - The TwitterBot constructor function  
 */ 
function configureTwitterBot(apiKeys, configOptions = {}) {
  debug('configureTwitterBot');
  
  // The validate instance that will be used for all bots 
  const validate = constructValidate(configOptions.validatorOptions);
  
  // Ensure api keys provided and that they fit schema 
  if (!apiKeys) throw new Error('Config with API keys is required.');
  validate.apiKeys(apiKeys);
  
  // Validate configOptions against schema and set defaults 
  validate.configureTwitterBotOptions(configOptions);
  
  // The twit instance that will manage all interactions with twitter 
  const twit      = new configOptions.Twit(apiKeys);
  
  // Holder for account information that will be populated with GET request to 'account/verify_credentials'
  // TODO: Change this to an obj so it can be passed by reference? 
  // TODO: Add some sort of pending property so that multiple calls aren't made by each subbot? 
  let accountInfo = null;
  
  
  
  
  
  /*
   ██████  ██████  ███    ██ ███████ ████████ ██████  ██    ██  ██████ ████████  ██████  ██████
  ██      ██    ██ ████   ██ ██         ██    ██   ██ ██    ██ ██         ██    ██    ██ ██   ██
  ██      ██    ██ ██ ██  ██ ███████    ██    ██████  ██    ██ ██         ██    ██    ██ ██████
  ██      ██    ██ ██  ██ ██      ██    ██    ██   ██ ██    ██ ██         ██    ██    ██ ██   ██
   ██████  ██████  ██   ████ ███████    ██    ██   ██  ██████   ██████    ██     ██████  ██   ██
  */

  /**  
   * TwitterBot - Constructor function for bots 
   * @constructor
   * @param  {object} [options] - Options the configure this instance of TwitterBot and set the defaults for its children
   * @prop   {object} options.
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
    
    // Stream from GET/'user' if streaming enabled 
    this.stream  = null;
    
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
  TwitterBot.prototype.factory        = factory;
  TwitterBot.prototype.traverse       = traverse;
  TwitterBot.prototype.delegate       = delegate;
  TwitterBot.prototype.compareToRules = compareToRules;
  
  
  // TODO: Instead of returning the constructor function, should return an instance of it? 
  //       That way: 
  //         * Don't have to deal w/ _isRoot goofiness 
  //         * Can store root as a variable somewhere so that other stuff knows where the root is 
  //         * Simplifies the first part to just new TwitterBot(config, options) instead of janky require it, run once w/ config, then call new w/ what that returned -> too many steps 
  //         * Complicates the initial options a bit, because have to take in global config options at same time as options for first bot 
  //            * That said, it's not that big of a deal. The options passed to configureTwitterBot are either dep. inj. for testing or supposed to set defaults for TwitterBot options anyway. 
  //            * Use json schema merge to combine the options? 
  // TODO: Need to think about how to make it work for them to req. twitter-bot into a file, construct new one and set as exports, then require it in and pass into the real root one to use 
  configureTwitterBot.TwitterBot = TwitterBot;
  return new TwitterBot(configOptions);
  
  
  
  /*
  ███    ███ ███████ ████████ ██   ██  ██████  ██████  ███████
  ████  ████ ██         ██    ██   ██ ██    ██ ██   ██ ██
  ██ ████ ██ █████      ██    ███████ ██    ██ ██   ██ ███████
  ██  ██  ██ ██         ██    ██   ██ ██    ██ ██   ██      ██
  ██      ██ ███████    ██    ██   ██  ██████  ██████  ███████
  */

  function start() {
    debug('start');
  }
  
  function getAccountInfo() {
    debug('getAccountInfo');
  }
  
  function factory() {
    debug('factory');
  }
  
  function traverse(callback) {
    debug('traverse');
  }
  
  function delegate() {
    debug('delegate');
  }
  
  function compareToRules(tweet) {
    debug('compareToRules');
  }
  
}
