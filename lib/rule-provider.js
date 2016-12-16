/** @module rule-provider */

// npm modules 
const debug        = require('debug')('tb:rule-provider');
const Ajv          = require('ajv');

// internal modules 
const tweetSchemas = require('../tweet-schemas');


const rules        = {};


const ruleProvider = {
  
  /**    
   * defineRule - Registers a rule with the rule provider for later use 
   * @todo figure out how to get access to validate     
   * @param  {object} options The 
   */     
  defineRule(options, check) {
    // if (!options) throw new Error('Options are required for defineRule.');
    // if (typeof options !== 'object' || options instanceof Array) {
    //   throw new TypeError('Options passed to defineRule must be an object.');
    // }
    
    
  }, 
  
  get(ruleName) {
    
    
  }, 
  
  setOptions(options) {
    
  },
  
};







module.exports = ruleProvider;
