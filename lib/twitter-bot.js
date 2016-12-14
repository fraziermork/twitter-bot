/** @module TwitterBot */

// npm modules 
const debug = require('debug')('tb:TwitterBot');
const _     = require('lodash');

// internal modules 
const utils         = require('./utils');

// configuration 
const defaultOptions = require('../config/default-options');

module.exports       = TwitterBot;

/**
 * TwitterBot - Main module 
 *  
 * @param     {object}    config        - The twitter API keys 
 * @param     {object}    options       - Options for configuring the TwitterBot  
 * @property  {function}  options.twit  - Allows a custom constructor to be used in place of the twit library for testing purposes
 * @return {type}         description 
 */ 
function TwitterBot(config, options = {}) {
  debug('TwitterBot');
  
  // if they forgot to use new keyword 
  if (!(this instanceof TwitterBot)) return new TwitterBot(config, options);
  
  // Ensure api keys provided 
  if (!config) throw new Error('Config with API keys is required.');
  
  // Crude options validations 
  if (options.twit && typeof options.twit !== 'function') throw new TypeError('Options.twit must be a constructor function.');
  
  
  this.options = _.defaultsDeep({}, options, defaultOptions);
  this.twit    = new this.options.Twit(config);
  this.utils   = utils.call(this);
  
  
}
