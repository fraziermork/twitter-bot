
/**
 * @module rule-manager
 */ 

// npm modules 
const debug        = require('debug')('tb:rule-manager');
const co           = require('co');

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
 * compileRules - description
 *  
 * @param  {type} rules description 
 * @return {type}       description 
 */ 
function compileRules(rules) {
  debug('compileRules');
  for (let i = 0; i < rules.length; i++) {
    switch (typeof rules[i]) {
    case 'string': 
      // Need to retrieve the rule from ruleProvider
      var ruleName = rules[i];
      var rule     = ruleProvider.get(ruleName);
      
      // If it's a rule that implies more than one rule, like 'reply'
      if (rule instanceof Array) {
        rules.splice(i, 1, ...rule);
        i += rule.length;
        break;
      } 
      
      rules.splice(i, 1, rule);
      break;
    
    case 'function': 
      // Create a rule object for the rule 
      rules.splice(i, 1, {
        ruleName: rules[i].name || null,
        check:    rules[i],
        expect:   true,
        options:  null,
      });
      break;
    
    case 'object': 
      // If an array of rules, splice that array in and retest this index 
      // If it's already an object, don't need to do anything
      if (rules[i] instanceof Array) {
        rules.splice(i, 1, ...rules[i]);
        i--;
      }
      break;
      
    default: 
      throw new TypeError(`Rules must be strings, objects, or functions, got ${typeof rules[i]}`);
    }
  }
  return rules;
}




/**
 * checkRules - description
 *  
 * @param  {type} tweet description 
 * @return {type}       description 
 */ 
function checkRules(tweet) {
  debug('compareTweetAgainstRules');
  const self            = this;
  const ctx             = {};
  let allRulesMatchFlag = false;
  
  co(function *checkEachRule() {
    
    // Iterate through each rule and check it
    for (let i = 0; i < self.rules.length; i++) {
      let currentRule = self.rules[i];
      let isMatch = yield currentRule.check(tweet, ctx, currentRule.options);
      
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
