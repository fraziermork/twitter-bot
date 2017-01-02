/**
 * @module rule-manager
 */ 

// npm modules 
const debug           = require('debug')('tb:rule-manager');
const co              = require('co');
const _               = require('lodash');

// internal modules 
const ruleProvider    = require('./rule-provider');
const ValidationError = require('./validation-error');

module.exports        = RuleManager;


/**
 * RuleManager - Manages the rules associated with a particular TwitterBot instance 
 * @constructor
 * @param  {array} rules The array of rules for the TwitterBot 
 */ 
function RuleManager(rules) {
  debug('RuleManager');
  
  // Attach original rules for reference if needed 
  this.originalRules = rules;
  
  // The compiled rules 
  this.rules = this.compileRules(this.originalRules);
}

RuleManager.prototype.compileRules = compileRules;
RuleManager.prototype.checkRules   = checkRules;


/**
 * compileRules - Compiles the rules from a convenient form for using the api to the standard format for checkRules to consume
 *  
 * @param  {array} originalRules - An array of rule name strings, rule functions, rule objects, or rule schema objects 
 * @return {array}               - A clone of the original array, with all rules replaced by rule objects. May be of a different length if the original rules array contained any meta rules. 
 */ 
function compileRules(originalRules) {
  debug('compileRules');
  const rules = cloneRulesArray(originalRules);
  
  for (let i = 0; i < rules.length; i++) {
    let currentRule = rules[i];
    
    // Choose appropriate behavior based on type of currentRule
    switch (typeof rules[i]) {    
      
      
      // If they just pass in the name of a rule like 'reply'
      case 'string': {
        // Need to retrieve the rule from ruleProvider
        const ruleName = currentRule;
        const rule     = ruleProvider.get(ruleName);
        if (!rule) throw new Error(`No rule named ${ruleName} defined with ruleProvider.`);
        
        // If it's a meta rule 
        if (rule.isMetaRule) {
          const subRules = rule.rules.map((subRuleName) => {
            return {
              // Assign options from defaults 
              options:  _.defaults({}, rule.defaultOptions[subRuleName], rule.defaultOptions),
              ruleName: subRuleName,
            };
          });
          
          // Splice the sub rules in and recheck this index 
          rules.splice(i, 1, ...subRules);
          i--;
          break;
        } 
        
        // If it's a normal rule 
        rules.splice(i, 1, rule);
        break;
      } 
      
      
      
      
      
      /**      
       * If they pass in their own function to run against tweets       
       */       
      case 'function': {
        // Create a rule object for the rule 
        rules.splice(i, 1, {
          ruleName: currentRule.name || null,
          check:    rules[i],
          expect:   true,
          options:  { expect: true },
        });
        break;
      }
      
      
      
      
      /**      
       * If they passed in an object for the rule.  
       * This could have been a schema, like: 
       * ```javascript 
       * { 
       *   type: 'object',
       *   id:   'schemaRule', 
       *   properties: { 
       *     stuff: {
       *       type: 'string',
       *     }
       *   }, 
       * }
       * ```
       * This could have been a schema-based rule object, like: 
       * ```javascript
       * { 
       *   ruleName: 'schemaRule',
       *   
       *   // Schema object like the one above 
       *   schema:    {}, 
       *   
       *   // Optional, replaces default schema validator 
       *   check:     function(){},
       * }
       * ```
       * 
       * This could have been a rule object with a custom check function, like: 
       * ```javascript
       * {
       *   ruleName: 'checkFnRule', 
       *   check      function() {},
       * 
       *   // optional 
       *   options:   {}, 
       * }
       * 
       * ```
       * This could have been a rule object with the name of another rule, like: 
       * ```javascript
       * {
       *   ruleName: 'someRuleName'
       * 
       *   // optional 
       *   options:  {}, 
       * }
       * ```
       */       
      case 'object': {
        // If an array of rules, splice that array in and retest this index 
        if (rules[i] instanceof Array) {
          throw new Error(`Rules array can hold objects, strings, and functions only, but got an Array at position ${i}.`);
        }
        
        // If the currentRule is a schema 
        if (currentRule.properties) {
          currentRule = { schema: currentRule, options: { expect: true } };
          rules.splice(i, 1, currentRule);
        }
        
        // If the currentRule is based on a schema 
        if (currentRule.schema) {
          currentRule.ruleName = currentRule.ruleName || currentRule.schema.id;
          
          const schemaIsValid = ruleProvider.ajv.validateSchema(currentRule.schema);
          if (!schemaIsValid) throw new ValidationError(currentRule.ruleName, ruleProvider.ajv.errors);
          
          if (currentRule.check) {
            currentRule.check = currentRule.check(ruleProvider.ajv, currentRule);
            if (typeof currentRule.check !== 'function') throw new Error('Custom check functions for schema based rules must return a function.');
          } else {
            currentRule.check = (function(currentRule) {
              return function(tweet) {
                return ruleProvider.validate(currentRule.schema, tweet);
              };
            })(currentRule);
          }
          break;
        }
        
        
        // If they passed in their own check function, don't need to do anything 
        if (currentRule.check) {
          currentRule.options = _.defaultsDeep(currentRule.options,  { expect: true });
          break;
        }
        
        
        // Else need to get the rule from the provider 
        const retrievedRule = ruleProvider.get(currentRule.ruleName);
        if (!retrievedRule) throw new Error(`No rule named ${currentRule.ruleName} defined with ruleProvider.`);
        currentRule.options = _.defaultsDeep({}, currentRule.options, retrievedRule.defaultOptions);
        
        // If it's a meta rule 
        if (retrievedRule.isMetaRule) {
          const subRules = retrievedRule.rules.map((subRuleName) => {
            return {
              // Assign options from defaults 
              options:  _.defaults({}, currentRule.options[subRuleName], currentRule.options),
              ruleName: subRuleName,
            };
          });
          
          // Splice the sub rules in and recheck this index 
          rules.splice(i, 1, ...subRules);
          i--;
          break;  
        }
        
        // If it's a normal rule 
        _.defaultsDeep(currentRule, retrievedRule);
        break;
      }
      
        
      default: {
        throw new TypeError(`Rules must be strings, objects, or functions, got ${typeof currentRule}`);
      }
    }
  }
  return rules;
}







/**
 * checkRules - Iterate through each rule and compare it against each rule, then return the results of the comparison 
 * @todo figure out how to handle errors that occur in a check function  
 * @param  {object} tweet - A tweet object to compare against the rules 
 * @return {promise}      - A promise that resolves with an object containing the context and the match results or that rejects with an error 
 */ 
function checkRules(tweet) {
  debug('compareTweetAgainstRules');
  const self            = this;
  const ctx             = {};
  let allRulesMatchFlag = true;
  
  return co(function *checkEachRule() {
    
    // Iterate through each rule and check it
    for (let i = 0; i < self.rules.length; i++) {
      let currentRule = self.rules[i];
      let isMatch     = yield currentRule.check(tweet, ctx, currentRule.options);
      
      // TODO: figure out a way to provide a more meaningful error message w/ more information 
      if (typeof isMatch !== 'boolean') throw new TypeError('All rules must return a boolean.');
      if (isMatch !== currentRule.options.expect) {
        allRulesMatchFlag = false;
        break;
      }
    }
    
    // Return the result and the context 
    return {
      match:   allRulesMatchFlag,
      context: ctx, 
    };
  });
}




/**
 * cloneRulesArray - Clones an array of rules so that mutations don't affect the  
 * @private
 * @param  {array} rules An array of rules of any data type (except array) to clone  
 * @return rules 
 */ 
function cloneRulesArray(rules) {
  return rules.map((originalRule) => {
    // Copy rule objects (no rules are arrays)
    if (typeof originalRule === 'object') return _.defaultsDeep({}, originalRule);
    
    // if primitive type or function 
    return originalRule;
  });
}
