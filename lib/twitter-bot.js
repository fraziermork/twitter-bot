/** @module TwitterBot */

// npm modules 
const debug = require('debug')('tb:TwitterBot');
const twit  = require('twit');

// internal modules 
const utils         = require('./utils');
// const delegator     = require('./delegator');
// const ruleManager   = require('./ruleManager');
// const subBotManager = require('./subBotManager');
// const subBot        = require('./sub-bot');


/**
 * TwitterBot - description
 *  
 * @param     {object}    config        - The twitter API keys needed to construct a  
 * @param     {object}    options       - description 
 * @property  {function}  options.twit  - Allows a custom constructor to be used in place of the twit library for testing purposes
 * @return {type}         description 
 */ 
function TwitterBot(config, options = {}) {
  debug('TwitterBot');
  if (!config) throw new Error('Config with API keys is required.');
  
  
  
}
