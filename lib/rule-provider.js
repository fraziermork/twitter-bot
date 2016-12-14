/** @module rule-provider */

const debug = require('debug')('tb:rule-provider');


function ruleProvider(handler) {
  debug('ruleProvider');
  
  // A collection of all rules that will 
  const rules = {
    
    isMention() {
      
      
    }, 
    
    isReply() {
      
      
    }, 
    
    isRetweet() {
      
      
    }, 
    
    isQuoted() {
      
      
    },
    
    isTextMatch() {
      
      
    }, 
    
  };
  
  return {
    defineRule(ruleName, check) {
      
    }, 
    get(ruleName) {
      
    }, 
  };
  
}





module.exports = ruleProvider;
