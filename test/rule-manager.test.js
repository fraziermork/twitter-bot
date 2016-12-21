// npm modules 
const debug        = require('debug');
const chai         = require('chai');
const expect       = chai.expect;

// internal modules 
const ruleProvider = require('../lib/rule-provider');
const RuleManager  = require('../lib/rule-manager');

describe('RuleManager', function() {
  
  describe('compile', function() {
    
    it('should be able to handle string rule names that return a single rule');
    
    it('should be able to handle string rule names that return an array of rules');
    
    it('should be able to handle input check functions');
    
    it('should be able to handle full rules objects');
    
  });
  
  describe('checkRules', function() {
    
    it('should be able to handle tweets that do not match with the rules');
    
    it('should be able to handle tweets that match with the rules');
    
    it('should throw the appropriate error if rules dont return the appropriate thing');
    
    it('should reject if one of the rules functions throws an error');
    
  });
  
});
