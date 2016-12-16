/** 
* Twitter Bot 
* @module twitter-bot 
*/

// npm modules 
const debug             = require('debug')('tb:TwitterBot');
const _                 = require('lodash');

// internal modules 
const utils             = require('./utils');
const validator         = require('../validator');

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
  
  // Ensure api keys provided and that they fit schema 
  if (!apiKeys) throw new Error('Config with API keys is required.');
  validator.validate.apiKeys(apiKeys);
  
  // Validate configOptions against schema and set defaults 
  validator.validate.configureTwitterBotOptions(configOptions);
  
  // The twit instance that will manage all interactions with twitter 
  const twit = new configOptions.Twit(apiKeys);
  
  
  
  
  
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
   * @return {TwitterBot}
   */   
  function TwitterBot(options = {}) {
    if (!(this instanceof TwitterBot)) return new TwitterBot(options);
    
    // Validate the supplied options and set defaults 
    validator.validate.twitterBotOptions(options);
    
    // Attach options
    this.options = options;
    
    // Attach twit instance for use 
    this.twit    = twit;
    
    // Stream from GET/'user' if streaming enabled 
    this.stream  = null;
    
    // Attach utilities 
    // TODO: Refactor this to be less clumsy 
    // TODO: Refactor so that always has a ref to the root node, and can accept options for an individual bot? 
    this.utils   = utils(this);
    
    // Container for child TwitterBots
    this.bots    = [];
    
    // Rules required to match with this bot, if any 
    this.rules   = options.rules || [];
  
    // This is set to true only by the first instance returned from configureTwitterBot
    this._isRoot = false; 
    
  }
  
  
  TwitterBot.prototype.start          = start;
  TwitterBot.prototype.getAccountInfo = getAccountInfo;
  TwitterBot.prototype.factory        = factory;
  TwitterBot.prototype.traverse       = traverse;
  TwitterBot.prototype.delegate       = delegate;
  TwitterBot.prototype.compareToRules = compareToRules;
  
  // TODO: Need to think about how to make it work for them to req. twitter-bot into a file, construct new one and set as exports, then require it in and pass into the real root one to use 
  configureTwitterBot.TwitterBot = TwitterBot;
  
  // This will be the topmost bot that all the children belong to and inherit options from 
  // TODO: It might be best if this just didn't inherit options from configureTwitterBot, that way they couldn't accidentally add rules to the root node 
  const rootBot = new TwitterBot(configOptions);
  rootBot._isRoot = true;
  
  // Returns the root twitterBot instance/node 
  return rootBot;
  
  
  
  
  /*
  ███    ███ ███████ ████████ ██   ██  ██████  ██████  ███████
  ████  ████ ██         ██    ██   ██ ██    ██ ██   ██ ██
  ██ ████ ██ █████      ██    ███████ ██    ██ ██   ██ ███████
  ██  ██  ██ ██         ██    ██   ██ ██    ██ ██   ██      ██
  ██      ██ ███████    ██    ██   ██  ██████  ██████  ███████
  */
  
  
  
  
  /**  
   * start - Initializes the connection with twitter 
   *    
   * @return {type}  description   
   */   
  function start() {
    debug('start');
  }
  
  
  
  
  
  /**  
   * getAccountInfo - Makes request to get authenticated accounts username for rules to use 
   *    
   * @return {type}  description   
   */   
  function getAccountInfo() {
    debug('getAccountInfo');
  }
  
  
  
  
  
  /**  
   * factory - Factory function to define child bots that inherit options from the current one. Returns this for chainability.  
   * 
   * @chainable    
   * @param  {object} options Options for the new bot. @see {@link TwitterBot}
   * @return {this} 
   */   
  function factory(options) {
    debug('factory', options);
    
    // Apply rules descending from parent bot but shield the rules so that they don't get re-checked 
    _.defaultsDeep(options, { rules: [] }, this.rules);
    validator.validate.factoryOptions(options);
    
    // The new, child TwitterBot instance
    const subBot = new TwitterBot(options);
    
    // Add it to the bots array so that it can be checked
    this.bots.push(subBot);
    
    return this;
  }
  
  
  
  /**  
   * traverse - Traverses down the tree of twitterBots 
   *    
   * @param  {type} callback description   
   * @param  {type} options  description   
   * @return {type}          description   
   */   
  function traverse(callback, options) {
    debug('traverse');
  }
  
  
  
  function delegate() {
    debug('delegate');
  }
  
  
  
  function compareToRules(tweet) {
    debug('compareToRules');
  }
  
}
