// npm modules 
const debug           = require('debug')('tb:test-ruleProvider');
const Ajv             = require('ajv');
const chai            = require('chai');
const expect          = chai.expect;

// internal modules 
const ruleProvider    = require('../lib/rule-provider');
const ValidationError = require('../lib/validation-error');

describe('ruleProvider', function() {
  it('should have the expected properties', function() {
    expect(ruleProvider.ajv).to.be.instanceof(Ajv);
    expect(ruleProvider.get).to.be.a('function');
    expect(ruleProvider.define).to.be.a('function');
    expect(ruleProvider.setOptions).to.be.a('function');
  });
  
  describe('define', function() {
    it('should let you define a rule with a function and a ruleName', function() {
      const ruleName = ruleProvider.define(function(){}, 'test1');
      expect(ruleName).to.equal('test1');
    });
    it('should let you define a rule with a named function', function() {
      const ruleName = ruleProvider.define(function notTest2() {}, 'test2');
      expect(ruleName).to.equal('test2');
    });
    it('should let you define a rule with a schema and a ruleName', function() {
      const ruleName = ruleProvider.define({
        type: 'object',
      }, 'test3');
      expect(ruleName).to.equal('test3');
    });
    it('should let you define a rule with a schema with an id', function() {
      const ruleName = ruleProvider.define({
        type: 'object',
        id:   'notTest4',
      }, 'test4');
      expect(ruleName).to.equal('test4');
    });
    
    describe('defaulting', function() {
      it('should default to the checkFn name if no ruleName is provided', function() {
        const ruleName = ruleProvider.define(function test5(){});
        expect(ruleName).to.equal('test5');
      });
      it('should default to the schema.id if no ruleName is provided', function() {
        const ruleName = ruleProvider.define({
          type: 'object',
          id:   'test6',
        });
        expect(ruleName).to.equal('test6');
      });
    });
    
    
    describe('errors', function() {
      it('should throw an error if no rule name is provided and the function is not named', function() {
        expect(function() {
          ruleProvider.define(function() {});
        }).to.throw(Error);
      });
      it('should throw an error if no rule name is provided and the schema has no id', function() {
        expect(function() {
          ruleProvider.define({
            type: 'object',
          });
        }).to.throw(Error);
      });
    });
  });
  
  
  describe('get', function() {
    it('should be able to retrieve rules by name', function() {
      function getTest() {}
      ruleProvider.define(getTest);
      expect(ruleProvider.get('getTest')).to.equal(getTest);
    });
    it('should return null if no rule with the provided name is found', function() {
      expect(ruleProvider.get('notARule')).to.equal(null);
    });
  });
  
  describe('setOptions', function() {
    it('should let you set the options for the ajv instance being used');
  });
  
});
