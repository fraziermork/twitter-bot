
/**
 * @module rule-manager
 */ 

// npm modules 
const debug        = require('debug')('tb:rule-manager');
const co           = require('co');
const _            = require('lodash');

// internal modules 
const ruleProvider = require('./rule-provider');

module.exports     = RuleManager;


/**
 * RuleManager - Manages the rules associated with a particular TwitterBot instance 
 * @constructor
 * @param  {array} rules The array of rules for the TwitterBot 
 */ 
function RuleManager(rules) {
  debug('RuleManager');
  
  // The compiled rules 
  this.rules = this.compileRules(rules);
}

RuleManager.prototype.compileRules = compileRules;
RuleManager.prototype.checkRules   = checkRules;


/**
 * compileRules - Compiles the rules from a convenient form for using the api to the standard format for checkRules to consume
 *  
 * @param  {type} rules description 
 * @return {type}       description 
 */ 
function compileRules(rules) {
  debug('compileRules');
  for (let i = 0; i < rules.length; i++) {
    let currentRule = rules[i];
    
    // Choose appropriate behavior based on type of currentRule
    switch (typeof rules[i]) {    
      
      
      // If they just pass in the name of a rule like 'reply'
      case 'string': {
        // Need to retrieve the rule from ruleProvider
        const ruleName = currentRule;
        const rule     = ruleProvider.get(ruleName);
        
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
          options:  null,
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
          throw new Error(`Rules array can hold objects, strings, and functions only. Function found at position ${i}.`);
        }
        
        // If the currentRule is a schema 
        if (currentRule.properties) currentRule = { schema: currentRule };
        
        // If the currentRule is based on a schema 
        if (currentRule.schema) {
          currentRule.ruleName = currentRule.ruleName || currentRule.schema.id;
          if (currentRule.check) {
            currentRule.check = currentRule.check(ruleProvider.ajv, currentRule);
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
        if (currentRule.check) break;
        
        
        // Else need to get the rule from the provider 
        const retrievedRule = ruleProvider.get(currentRule.ruleName);
        if (retrievedRule.defaultOptions) _.defaultsDeep(currentRule.options, retrievedRule.defaultOptions);
        
        // If it's a meta rule 
        if (retrievedRule.isMetaRule) {
          const subRules = currentRule.rules.map((subRuleName) => {
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
        throw new TypeError(`Rules must be strings, objects, or functions, got ${typeof rules[i]}`);
      }
    }
  }
  return rules;
}







/**
 * checkRules - Iterate through each rule and compare it against each rule, then return the results of the comparison 
 * @todo figure out how to handle errors that occur in a check function  
 * @param  {type} tweet description 
 * @return {type}       description 
 */ 
function checkRules(tweet) {
  debug('compareTweetAgainstRules');
  const self            = this;
  const ctx             = {};
  let allRulesMatchFlag = false;
  
  return co(function *checkEachRule() {
    
    // Iterate through each rule and check it
    for (let i = 0; i < self.rules.length; i++) {
      let currentRule = self.rules[i];
      let isMatch     = yield currentRule.check(tweet, ctx, currentRule.options);
      
      // TODO: figure out a way to provide a more meaningful error message w/ more information 
      if (typeof isMatch !== 'boolean') throw new TypeError('All rules must return a boolean.');
      if (isMatch !== currentRule.expect) break;
      
      // If all rules matched, return true 
      if (i === self.rules.length - 1) {
        allRulesMatchFlag = true;
      }
    }
    
    // Return the result and the context 
    return {
      match:   allRulesMatchFlag,
      context: ctx, 
    };
  });
}
