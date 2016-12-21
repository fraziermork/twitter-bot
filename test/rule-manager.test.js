// npm modules 
const debug        = require('debug');
const chai         = require('chai');
const expect       = chai.expect;

// internal modules 
const ruleProvider = require('../lib/rule-provider');
const RuleManager  = require('../lib/rule-manager');

describe('RuleManager', function() {
  
  describe('compile', function() {
    describe('schema rules', function() {
      it('should handle schema based rules');
      it('should handle rules objects with schema based rules');
      it('should handle custom check functions');
      describe('errors', function() {
        it('should handle errors from invalid schemas');
        it('should throw an error if the custom check function doesn\'t return a function');
      });
    });
    
    describe('custom check funtion rules', function() {
      it('should handle custom check function rules');
      it('should handle rules objects with custom check functions');
      describe('errors', function() {
        it('should handle errors thrown from inside custom check functions');
      });
    });
    
    describe('standard rule names', function() {
      it('should handle string rule names for standard rules');
      it('should handle rules objects with standard rule names');
      it('should handle rules objects with standard rule names and options');
      describe('errors', function() {
        it('should throw errors if a rule with that name doesn\t exist');
        it('should throw errors if a rule with the name of options.ruleName name doesn\t exist');
      });
    });
    
    describe('meta rule names', function() {
      it('should handle string rule names for meta rules');
      it('should handle rules objects with meta rule names');
      it('should handle rules objects with meta rule names and options');
      it('should handle rules objects with meta rule names nad custom options by subrule');
    });
    
    describe('multiple rules', function() {
      it('should be able to compile multiple rules');
      it('should be able to compile multiple rules in different formats');
    });
    
    describe('errors', function() {
      it('should throw errors for invalid rules objects');
    });
  });
  
  
  describe('checkRules', function() {
    it('should handle tweets that match with the set of rules');
    it('should handle tweets that don\'t match with the set of rules');
    describe('errors', function() {
      it('should throw an error if rules don\'t return a boolean');
      it('should handle errors thrown by check functions');
    });
  });
  
});
