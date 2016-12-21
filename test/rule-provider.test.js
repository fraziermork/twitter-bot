// npm modules 
const debug           = require('debug')('tb:test-ruleProvider');
const Ajv             = require('ajv');
const chai            = require('chai');
const expect          = chai.expect;

// internal modules 
const ruleProvider    = require('../lib/rule-provider');
// const ValidationError = require('../lib/validation-error');

describe('ruleProvider', function() {
  it('should have the expected properties', function() {
    expect(ruleProvider.ajv).to.be.instanceof(Ajv);
    expect(ruleProvider.get).to.be.a('function');
    expect(ruleProvider.define).to.be.a('function');
    expect(ruleProvider.setOptions).to.be.a('function');
  });
  
  describe('define', function() {
    it('should let you define a rule with a check function and a ruleName', function() {
      const ruleName = ruleProvider.define({ check: function(){}, ruleName: 'checkFnAndRuleNameTest'});
      expect(ruleName).to.equal('checkFnAndRuleNameTest');
    });
    it('should let you define a rule with a named function', function() {
      const ruleName = ruleProvider.define({ check: function notTest2() {}, ruleName: 'namedFnTest' });
      expect(ruleName).to.equal('namedFnTest');
    });
    it('should let you define a rule with a schema and a ruleName', function() {
      const ruleName = ruleProvider.define({ 
        schema: {
          type: 'object',
          properties: {
            stuff: {
              type: 'string',
            },
          },
        }, 
        ruleName: 'schemaAndRuleNameTest',
      });
      expect(ruleName).to.equal('schemaAndRuleNameTest');
    });
    it('should let you define a rule with a schema with an id', function() {
      const ruleName = ruleProvider.define({
        schema: {
          type: 'object',
          id:   'aDifferentRuleName',
          
          properties: {
            stuff: {
              type: 'string',
            },
          },
        },
        ruleName: 'schemaIdAndRuleNameTest',
      });
      expect(ruleName).to.equal('schemaIdAndRuleNameTest');
    });
    
    it('should let you define a meta rule', function() {
      const firstSubRuleName = ruleProvider.define({
        check:    function() {}, 
        ruleName: 'firstSubRule',
      });
      const secondSubRuleName = ruleProvider.define({
        check:    function() {}, 
        ruleName: 'secondSubRule',
      });
      
      const metaRuleName = ruleProvider.define({
        ruleName:   'metaRuleTest',
        isMetaRule: true,
        
        rules: [
          firstSubRuleName,
          secondSubRuleName,
        ],
      });
      expect(metaRuleName).to.equal('metaRuleTest');
    });
    
    
    
    describe('defaulting', function() {
      it('should default to the checkFn name if no ruleName is provided', function() {
        const ruleName = ruleProvider.define({ check: function ruleNameDefaultToFnNameTest(){} });
        expect(ruleName).to.equal('ruleNameDefaultToFnNameTest');
      });
      it('should default to the schema.id if no ruleName is provided', function() {
        const ruleName = ruleProvider.define({
          type: 'object',
          id:   'ruleNameDefaultToSchemaIdTest',
          
          properties: {
            stuff: {
              type: 'string',
            },
          },
        });
        expect(ruleName).to.equal('ruleNameDefaultToSchemaIdTest');
      });
    });
    
    
    describe('errors', function() {
      it('should throw an error if no rule name is provided and the function is not named', function() {
        expect(function() {
          ruleProvider.define({ check: function() {} });
        }).to.throw(Error);
      });
      it('should throw an error if schema has no id', function() {
        expect(function() {
          ruleProvider.define({
            type: 'object',
            properties: {
              stuff: {
                type: 'string',
              },
            },
          });
        }).to.throw(Error, 'No rule name provided for define rule. Rule name must be options.check.name, options.schema.id, or options.ruleName.');
      });
      it('should throw an error if no rule name is provided and the schema has no id', function() {
        expect(function() {
          ruleProvider.define({
            schema: {
              type: 'object',
              properties: {
                stuff: {
                  type: 'string',
                },
              },
            },
          });
        }).to.throw(Error, 'No rule name provided for define rule. Rule name must be options.check.name, options.schema.id, or options.ruleName.');
      });
      it('should throw an error if no rule name is provided for a meta rule', function() {
        const firstSubRuleName = ruleProvider.define({
          check:    function() {}, 
          ruleName: 'firstSubRule',
        });
        const secondSubRuleName = ruleProvider.define({
          check:    function() {}, 
          ruleName: 'secondSubRule',
        });
        expect(function() {
          ruleProvider.define({
            isMetaRule: true,
            
            rules: [
              firstSubRuleName,
              secondSubRuleName,
            ],
          });
        }).to.throw(Error, 'No rule name provided for define rule. Rule name must be options.check.name, options.schema.id, or options.ruleName.');
      });
      it('should throw an error if not enough rules are listed for a meta rule', function() {
        expect(function() {
          ruleProvider.define({
            ruleName: 'metaRuleTest',
            isMetaRule:   true,
            rules:        [],
          });
        }).to.throw(Error, 'Options.rules must list the names of at least 2 other rules for meta rules definitions.');
      });
      it('should throw an error if meta rule lists nonexistent rules', function() {
        const validSubRuleName = ruleProvider.define({
          check:    function() {}, 
          ruleName: 'validSubRule',
        });
        expect(function() {
          ruleProvider.define({
            ruleName: 'metaRuleNonexistentSubRuleTest',
            isMetaRule:   true,
            rules:        [
              validSubRuleName,
              'notARealRule',
            ],
          });
        }).to.throw(Error, 'Could not find rules notARealRule for metaRuleNonexistentSubRuleTest meta rule definition.');
      });
    });
  });
  
  
  describe('get', function() {
    it('should be able to retrieve rules by name', function() {
      const dummyOptions = {
        check: function getTest() {},
      };
      ruleProvider.define(dummyOptions);
      expect(ruleProvider.get('getTest')).to.equal(dummyOptions);
    });
    
    it('should be able to retrieve meta rules', function() {
      const firstSubRuleName = ruleProvider.define({
        check:    function() {}, 
        ruleName: 'firstSubRuleGetTest',
      });
      const secondSubRuleName = ruleProvider.define({
        check:    function() {}, 
        ruleName: 'secondSubRuleGetTest',
      });
      
      const metaRuleDefinitionOptions = {
        ruleName:   'metaRuleTestGetTest',
        isMetaRule: true,
        
        rules: [
          firstSubRuleName,
          secondSubRuleName,
        ],
      };
      const metaRuleName = ruleProvider.define(metaRuleDefinitionOptions);
      expect(ruleProvider.get(metaRuleName)).to.equal(metaRuleDefinitionOptions);
    });
    
    it('should return null if no rule with the provided name is found', function() {
      expect(ruleProvider.get('notARule')).to.equal(null);
    });
  });
  
  describe('setOptions', function() {
    it('should let you set the options for the ajv instance being used');
  });
  
});
