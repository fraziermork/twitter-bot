/**
 * @module rule-provider
 */ 

// npm modules 
const debug        = require('debug')('tb:rule-provider');
const Ajv          = require('ajv');

// internal modules 
const validator    = require('./validator');
const tweetSchemas = require('../tweet-schemas');
const defaultRules = require('../rules');
// const metaRules    = require('../rules/meta-rules');

const rules        = {};

const ruleProvider = {
  
  // The names of all rules that have been registered 
  ruleNames: [],
  
  // The ajv instance that will be used for the schema-based rules 
  ajv: new Ajv({
    v5: true, 
  }),
  
  
  
  /**  
   * define - Registers a rule with the rule provider for later use 
   *    
   * @param  {object}   options                - Information about the rule being defined or just the schema for the rule with an id property 
   * @prop   {boolean}  options.isMetaRule     - Flag for whether this rule is a meta rule (a listing of other rules). Meta rules can only be defined after all the rules they depend on have been defined.  
   * @prop   {array}    options.rules          - Array of other rule names that this is a combination, only passed if isMetaRule is true  
   * @prop   {function} options.check          - The check function to run against incoming tweets, or if a schema is provided, a function that returns a custom validator function to run against incoming tweets  
   * @prop   {object}   options.schema         - A schema to compare incoming tweets against 
   * @prop   {string}   options.ruleName       - The name to register the rule as. Defaults to options.schema.id or to options.check.name, but if these aren't present either, throws an error. 
   * @prop   {object}   options.defaultOptions - Default options for the check function to take 
   * @return {string}                          - The name the rule was registered with ruleProvider as 
   */   
  define(options) {
    debug('define');
    
    // If they passed in just a schema
    // In which case, they shouldn't have passed in ruleName or defaultOptions, because that would alter the schema   
    if (options.properties) {
      options = {
        schema: options, 
      };
    }
    
    validator.validate.defineRuleOptions(options);
    
    // If they passed in a meta rule 
    if (options.isMetaRule) {
      if (!options.ruleName) {
        throw new Error('No rule name provided for define rule. Rule name must be options.check.name, options.schema.id, or options.ruleName.');
      }
      if (!options.rules || !(options.rules instanceof Array) || options.rules.length < 2) {
        throw new Error('Options.rules must list the names of at least 2 other rules for meta rules definitions.');
      }
      
      // Make sure all dependency rules exist 
      const invalidRuleNames = options.rules.reduce((invalidRuleNames, subRuleName) => {
        if (!ruleProvider.get(subRuleName)) invalidRuleNames.push(subRuleName);
        return invalidRuleNames;
      }, []);
      if (invalidRuleNames.length) throw new Error(`Could not find rules ${invalidRuleNames.join(', ')} for ${options.ruleName} meta rule definition.`);
      
      rules[options.ruleName] = options;
      ruleProvider.ruleNames.push(options.ruleName);
      return options.ruleName;
    }
    
    // If they passed in a rule based on a shema 
    if (options.schema) {
      // Ensure that these default to one another 
      if (!options.schema.id) options.schema.id = options.ruleName;
      if (!options.ruleName)  options.ruleName  = options.schema.id;
      if (!options.ruleName) throw new Error('No rule name provided for define rule. Rule name must be options.check.name, options.schema.id, or options.ruleName.');
      
      // If they provided their own check fn, need to pass it ajv instance and reset check to the result 
      if (options.check) {
        options.check = options.check(ruleProvider.ajv, options);
        if (typeof options.check !== 'function') throw new TypeError('Custom check functions for schemas must return a function.');
      } else {
        options.check = defaultCheck;
      }
      
      rules[options.ruleName] = options;
      ruleProvider.ruleNames.push(options.ruleName);
      return options.ruleName;
    }
    
    // If they passed in their own check function 
    if (options.check) {
      if (!options.ruleName) {
        if (options.check.name) {
          options.ruleName = options.check.name;
        } else {
          throw new Error('No rule name provided for define rule. Rule name must be options.check.name, options.schema.id, or options.ruleName.');
        }
      }
      rules[options.ruleName] = options;
      ruleProvider.ruleNames.push(options.ruleName);
      return options.ruleName;
    }
    
    throw new Error('ruleProvider.defineRule called with invalid options.');
    
    
    // The default check function for schema rules 
    function defaultCheck(tweet) {
      return ruleProvider.ajv.validate(options.schema.id, tweet);
    }
  },
  
  // /**      
  //  * defineRule - Registers a rule with the rule provider for later use 
  //  *    
  //  * @param  {function|object} checkFn          - A function to act as a rule, or a schema to use to sort tweets 
  //  * @param  {string}          [ruleName]       - The name of the rule. Defaults to the name of the checkFn or to the id of the schema, but throws an exception if these aren't passed in either. 
  //  * @param  {object}          [defaultOptions] - Default options for the rule being defined 
  //  */   
  // define(checkFn, ruleName, defaultOptions) {
  //   debug('define');
  //   var schema;
  //   
  //   // If they passed in their own check function as the first argument 
  //   // like define(function(){}, 'myRule'); or define(function myRule(){})
  //   if (typeof checkFn === 'function') {
  //     debug('passed in a function');
  //     if (!ruleName && checkFn.name) {
  //       ruleName = checkFn.name;
  //     } else if (!ruleName) {
  //       throw new Error('utils.defineRule called without providing a name for the rule.');
  //     }
  //     rules[ruleName] = {
  //       check:    checkFn, 
  //       name:     ruleName, 
  //       defaults: defaultOptions,
  //     };
  //     return ruleName;
  //   }
  //   
  //   // Define the rule if they passed in a schema 
  //   debug('passed in a schema');
  //   schema = checkFn;
  //   
  //   // Ensure the ruleName and schema id default to one another 
  //   ruleName  = ruleName || schema.id;
  //   schema.id = schema.id || ruleName;
  //   if (!ruleName) throw new Error('utils.defineRule called without providing a name for the rule.');
  //   
  //   validator.validate.defineRuleSchema(schema);
  //   this.ajv.addSchema(schema);
  //   rules[ruleName] = (tweet) => {
  //     return this.ajv.validate(schema.id, tweet);
  //   };
  //   return ruleName;
  // }, 
  
  
  /**  
   * defineAll - Defines all rules on an object
   *    
   * @param  {object} rules - An object with rule functions or schemas. The keys will be passed as ruleName to ruleProvider.define, and the values will be passed as checkFn. @see {@link define}
   */   
  defineAll(rules) {
    Object.keys(rules).forEach((ruleName) => {
      ruleProvider.define(rules[ruleName], ruleName);
    });
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


ruleProvider.defineAll(tweetSchemas);
ruleProvider.defineAll(defaultRules);

module.exports = ruleProvider;
