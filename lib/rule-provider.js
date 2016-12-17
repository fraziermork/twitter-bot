/**
 * @module rule-provider
 */ 

// npm modules 
const debug        = require('debug')('tb:rule-provider');
const Ajv          = require('ajv');

// internal modules 
const validator    = require('./validator');
// const tweetSchemas = require('../tweet-schemas');

const rules        = {};

const ruleProvider = {
  ajv: new Ajv({
    v5: true, 
  }),
  
  
  /**      
   * defineRule - Registers a rule with the rule provider for later use 
   *    
   * @param  {function|object} checkFn    - A function to act as a rule, or a schema to use to sort tweets 
   * @param  {string }         [ruleName] - The name of the rule. Defaults to the name of the checkFn or to the id of the schema, but throws an exception if these aren't passed in either. 
   */   
  defineRule(checkFn, ruleName) {
    debug('defineRule');
    var schema;
    
    // If they passed in their own check function as the first argument 
    // like defineRule(function(){}, 'myRule'); or defineRule(function myRule(){})
    if (typeof checkFn === 'function') {
      debug('passed in a function');
      if (!ruleName && checkFn.name) {
        ruleName = checkFn.name;
      } else if (!ruleName) {
        throw new Error('utils.defineRule called without providing a name for the rule.');
      }
      rules[ruleName] = checkFn;
      return;
    }
    
    // Define the rule if they passed in a schema 
    debug('passed in a schema');
    schema = checkFn;
    
    // Ensure the ruleName and schema id default to one another 
    ruleName  = ruleName || schema.id;
    schema.id = schema.id || ruleName;
    if (!ruleName) throw new Error('utils.defineRule called without providing a name for the rule.');
    
    validator.validate.defineRuleOptions(schema);
    this.ajv.addSchema(schema);
    rules[ruleName] = (tweet) => {
      return this.ajv.validate(schema.id, tweet);
    };
  }, 
  
  
  /**  
   * get - Gets a rule function by name 
   *    
   * @param  {string}        ruleName - The name of the rule 
   * @return {function|null}          - The rule function, or null if no rule was found with that name 
   */   
  get(ruleName) {
    debug(`get ${ruleName}`);
    return rules[ruleName] || null;
  }, 
  
  
  /**  
   * setOptions - A way to provide 
   *    
   * @param  {object} options - Options to provide to the ajv instance that handles tweet schema validations 
   */   
  setOptions(options = {}) {
    debug('setOptions');
    validator.validate.ruleProviderOptions(options);
    this.ajv = new Ajv(options);
  },
  
};

module.exports = ruleProvider;
