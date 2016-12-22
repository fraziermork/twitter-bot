// npm modules 
const debug           = require('debug')('tb:test-ruleManager');
const chai            = require('chai');
const expect          = chai.expect;

// internal modules 
const ruleProvider    = require('../lib/rule-provider');
const RuleManager     = require('../lib/rule-manager');
const ValidationError = require('../lib/validation-error');

describe('RuleManager', function() {
  describe('compile', function() {
    describe('schema rules', function() {
      it('should handle schema based rules', function() {
        const testSchemaRule = {
          type: 'object',
          id:   'testSchemaRule',
          properties: {
            stuff: {
              type: 'string',
            },
          },
        };
        const ruleManager  = new RuleManager([testSchemaRule]);
        const compiledRule = ruleManager.rules[0];
        expect(ruleManager.rules.length).to.equal(1);
        expect(compiledRule.ruleName).to.equal(testSchemaRule.id);
        expect(compiledRule.check).to.be.a('function');
        expect(compiledRule.schema).to.equal(testSchemaRule);
      });
      it('should handle rules objects with schema based rules', function() {
        const testSchemaRule = {
          schema: {
            type: 'object',
            id:   'testSchemaRule',
            properties: {
              stuff: {
                type: 'string',
              },
            },
          },
        };
        const ruleManager  = new RuleManager([testSchemaRule]);
        const compiledRule = ruleManager.rules[0];
        expect(ruleManager.rules.length).to.equal(1);
        expect(compiledRule.ruleName).to.equal(testSchemaRule.schema.id);
        expect(compiledRule.check).to.be.a('function');
        expect(compiledRule.schema).to.equal(testSchemaRule.schema);
      });
      
      it('should prioritize naming schema rules after ruleName over schema.id', function() {
        const testSchemaRule = {
          schema: {
            type: 'object',
            id:   'testSchemaRule',
            properties: {
              stuff: {
                type: 'string',
              },
            },
          },
          ruleName: 'testSchemaRuleName',
        };
        const ruleManager  = new RuleManager([testSchemaRule]);
        const compiledRule = ruleManager.rules[0];
        expect(ruleManager.rules.length).to.equal(1);
        expect(compiledRule.ruleName).to.equal(testSchemaRule.ruleName);
        expect(compiledRule.check).to.be.a('function');
        expect(compiledRule.schema).to.equal(testSchemaRule.schema);
      });
      it('should handle custom check functions', function() {
        let checkFnHasBeenCalledFlag = false;
        const testSchemaRule = {
          schema: {
            type: 'object',
            id:   'testSchemaRule',
            properties: {
              stuff: {
                type: 'string',
              },
            },
          },
          ruleName: 'testSchemaRuleName',
          
          check(ajv, rule) {
            expect(ajv).to.equal(ruleProvider.ajv);
            expect(rule).to.equal(testSchemaRule);
            checkFnHasBeenCalledFlag = true;
            return function(){};
          },
        };
        const ruleManager  = new RuleManager([testSchemaRule]);
        const compiledRule = ruleManager.rules[0];
        expect(ruleManager.rules.length).to.equal(1);
        expect(compiledRule.ruleName).to.equal(testSchemaRule.ruleName);
        expect(compiledRule.check).to.be.a('function');
        expect(compiledRule.schema).to.equal(testSchemaRule.schema);
        expect(checkFnHasBeenCalledFlag).to.equal(true);
      });
      describe('errors', function() {
        it('should handle errors from invalid schemas', function() {
          expect(function() {
            new RuleManager([{
              schema: {
                type: 'object',
                id:   'testSchemaRule',
                properties: {
                  stuff: 'string',
                },
              },
            }]);
          }).to.throw(ValidationError);
        });
        it('should throw an error if the custom check function doesn\'t return a function', function() {
          const testSchemaRule = {
            schema: {
              type: 'object',
              id:   'testSchemaRule',
              properties: {
                stuff: {
                  type: 'string',
                },
              },
            },
            ruleName: 'testSchemaRuleName',
            check(){},
          };
          expect(function() {
            new RuleManager([testSchemaRule]);
          }).to.throw(Error, 'Custom check functions for schema based rules must return a function.');
        });
      });
    });
    
    describe('custom check function rules', function() {
      it('should handle custom check function rules', function() {
        function checkFn() {}
        const ruleManager  = new RuleManager([checkFn]);
        const compiledRule = ruleManager.rules[0];
        expect(ruleManager.rules.length).to.equal(1);
        expect(compiledRule.ruleName).to.equal(checkFn.name);
        expect(compiledRule.check).to.equal(checkFn);
      });
      it('should handle rules objects with custom check functions', function() {
        function checkFn() {}
        const checkRule = {
          check:    checkFn,
          ruleName: 'checkRule',
        };
        const ruleManager  = new RuleManager([checkRule]);
        const compiledRule = ruleManager.rules[0];
        expect(ruleManager.rules.length).to.equal(1);
        expect(compiledRule.ruleName).to.equal(checkRule.ruleName);
        expect(compiledRule.check).to.equal(checkFn);
      });
    });
    
    describe('standard rule names', function() {
      before('define a rule to use', function() {
        this.dummyRule = {
          check:    function() {},
          ruleName: 'dummyRuleName',
          options: {
            foo: 1, 
            bar: 2, 
          },
        };
        this.dummyRuleName = ruleProvider.define(this.dummyRule);
      });
      it('should handle string rule names for standard rules', function() {
        const ruleManager  = new RuleManager([this.dummyRuleName]);
        const compiledRule = ruleManager.rules[0];
        expect(ruleManager.rules.length).to.equal(1);
        expect(compiledRule.ruleName).to.equal(this.dummyRuleName);
        expect(compiledRule.options).to.equal(this.dummyRule.options);
      });
      it('should handle rules objects with standard rule names', function() {
        const ruleManager  = new RuleManager([{ ruleName: this.dummyRuleName }]);
        const compiledRule = ruleManager.rules[0];
        expect(ruleManager.rules.length).to.equal(1);
        expect(compiledRule.ruleName).to.equal(this.dummyRuleName);
      });
      it('should handle rules objects with standard rule names and options', function() {
        const ruleManager  = new RuleManager([{ ruleName: this.dummyRuleName, options: { foo: 2 } }]);
        const compiledRule = ruleManager.rules[0];
        expect(ruleManager.rules.length).to.equal(1);
        expect(compiledRule.ruleName).to.equal(this.dummyRuleName);
        expect(compiledRule.options.foo).to.equal(2);
        expect(compiledRule.options.bar).to.equal(this.dummyRule.options.bar);
      });
      describe('errors', function() {
        it('should throw errors if a rule with that name doesn\'t exist', function() {
          const badRuleName = 'badRuleName';
          expect(function() {
            new RuleManager([badRuleName]);
          }).to.throw(Error, `No rule named ${badRuleName} defined with ruleProvider.`);
        });
        it('should throw errors if a rule with the name of options.ruleName name doesn\t exist', function() {
          const badRuleName = 'badRuleName';
          expect(function() {
            new RuleManager([{ ruleName: badRuleName }]);
          }).to.throw(Error, `No rule named ${badRuleName} defined with ruleProvider.`);
        });
      });
    });
    
    describe('meta rule names', function() {
      before('define meta rule', function() {
        this.firstSubRuleName = ruleProvider.define({
          check:    function() {}, 
          ruleName: 'metaRuleCompileTestOne',
          options: {
            foo: 1, 
            bar: 2, 
          },
        });
        this.secondSubRuleName = ruleProvider.define({
          check:    function() {}, 
          ruleName: 'metaRuleCompileTestTwo',
          options: {
            foo: 1, 
            bar: 2, 
          },
        });
        
        this.metaRuleDefinitionOptions = {
          ruleName:   'metaRuleCompileTest',
          isMetaRule: true,
          
          defaultOptions: {
            [this.firstSubRuleName]: {
              foo: 3,
            }, 
            [this.secondSubRuleName]: {
              foo: 4,
            }, 
          },
          
          rules: [
            this.firstSubRuleName,
            this.secondSubRuleName,
          ],
        };
        this.metaRuleName = ruleProvider.define(this.metaRuleDefinitionOptions);
      });
      it('should handle a string rule name for a meta rule', function() {
        const ruleManager = new RuleManager([this.metaRuleName]);
        expect(ruleManager.rules.length).to.equal(2);
        [this.firstSubRuleName, this.secondSubRuleName].forEach((ruleName, i) => {
          expect(ruleManager.rules[i].ruleName).to.equal(ruleName);
        });
      });
      it('should handle rules objects with meta rule names', function() {
        const ruleManager = new RuleManager([{ ruleName: this.metaRuleName }]);
        expect(ruleManager.rules.length).to.equal(2);
        [this.firstSubRuleName, this.secondSubRuleName].forEach((ruleName, i) => {
          expect(ruleManager.rules[i].ruleName).to.equal(ruleName);
        });
      });
      it('should handle rules objects with meta rule names and options', function() {
        const ruleManager = new RuleManager([{ 
          ruleName: this.metaRuleName, 
        }]);
        expect(ruleManager.rules.length).to.equal(2);
        [this.firstSubRuleName, this.secondSubRuleName].forEach((ruleName, i) => {
          expect(ruleManager.rules[i].ruleName).to.equal(ruleName);
          expect(ruleManager.rules[i].options.foo).to.equal(this.metaRuleDefinitionOptions.defaultOptions[ruleName].foo);
        });
      });
    });
    
    describe('multiple rules', function() {
      it('should be able to compile multiple rules in different formats', function() {
        this.firstCompileRuleName = ruleProvider.define({
          check:    function() {}, 
          ruleName: 'multipleCompileTestOne',
          options: {
            foo: 1, 
            bar: 2, 
          },
        });
        this.secondCompileRuleName = ruleProvider.define({
          check:    function() {}, 
          ruleName: 'multipleCompileTestTwo',
          options: {
            foo: 1, 
            bar: 2, 
          },
        });
        const ruleManager = new RuleManager([
          this.firstCompileRuleName,
          { ruleName: this.secondCompileRuleName },
        ]);
        expect(ruleManager.rules.length).to.equal(2);
        [this.firstCompileRuleName, this.secondCompileRuleName].forEach((ruleName, i) => {
          expect(ruleManager.rules[i].ruleName).to.equal(ruleName);
        });
      });
    });
    
    describe('errors', function() {
      it('should throw errors for invalid rules objects', function() {
        expect(function() {
          new RuleManager([{
            ruleName: 'invalid',
          }]);
        }).to.throw(Error);
      });
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
