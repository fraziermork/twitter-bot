// npm modules 
// const debug           = require('debug')('tb:test-validator');
const chai            = require('chai');
const expect          = chai.expect;

// internal modules 
const validator       = require('../lib/validator');
const ValidationError = require('../lib/validation-error');


describe('validator', function() {
  it('should have default validator schemas already registered', function() {
    expect(validator.validate.configureTwitterBotOptions).to.be.a('function');
    expect(validator.validate.twitterBotOptions).to.be.a('function');
    expect(validator.validate.factoryOptions).to.be.a('function');
    expect(validator.validate.apiKeys).to.be.a('function');
  });
  
  describe('default validators', function() {
    const testSchema1 = {
      properties: {
        testing: {
          type: 'string',
        },
      },
    };
    it('should let you add a schema', function() {
      validator.addSchema('testSchema1', testSchema1);
      expect(validator.validate).to.have.property('testSchema1');
      expect(validator.ajv.getSchema('testSchema1')).to.not.equal(null);
    });
    
    it('should not throw errors if data matches schema', function() {
      const testSchema2 = {
        properties: {
          testing: {
            type: 'string',
          },
        },
      };
      const validData = {
        testing: 'hello',
      };
      validator.addSchema('testSchema2', testSchema2);
      expect(function() {
        validator.validate.testSchema2(validData);
      }).to.not.throw(ValidationError);
    });
    
    it('should throw ValidationError if data does not match schema', function() {
      const testSchema3 = {
        properties: {
          testing: {
            type: 'string',
          },
        },
      };
      const invalidData = {
        testing: 1,
      };
      validator.addSchema('testSchema3', testSchema3);
      expect(function() {
        validator.validate.testSchema3(invalidData);
      }).to.throw(ValidationError);
    });
  });
  
  describe('custom validators', function() {
    before('define testSchema', function() {
      const testSchema4 = {
        properties: {
          testing: {
            type: 'string',
          },
        },
      };
      this.testSchema4 = testSchema4;
      validator.addSchema('testSchema4', testSchema4);
    });
    it('should let you add a custom validator', function() {
      var testFlag = false;
      function customValidator(ajv, ajvSchemaId) {
        testFlag = true;
        expect(ajv).to.equal(validator.ajv);
        expect(ajvSchemaId).to.equal('testSchema4');
        return function(dataToValidate) {
          return ajv.validate(ajvSchemaId, dataToValidate);
        };
      }
      
      validator.addCustomValidator('testSchema4', customValidator);
      expect(testFlag).to.equal(true);
      
    });
    
    it('should not throw errors if data matches schema', function() {
      const validData = {
        testing: 'hello',
      };
      var testFlag = false;
      function customValidator(ajv, ajvSchemaId) {
        expect(ajv).to.equal(validator.ajv);
        expect(ajvSchemaId).to.equal('testSchema4');
        return function(dataToValidate) {
          testFlag = true;
          return ajv.validate(ajvSchemaId, dataToValidate);
        };
      }
      
      validator.addCustomValidator('testSchema4', customValidator);
      expect(function() {
        validator.validate.testSchema4(validData);
      }).to.not.throw(ValidationError);
      expect(testFlag).to.equal(true);
    });
    
    it('should throw ValidationError if data does not match schema', function() {
      const invalidData = {
        testing: 1,
      };
      var testFlag = false;
      function customValidator(ajv, ajvSchemaId) {
        expect(ajv).to.equal(validator.ajv);
        expect(ajvSchemaId).to.equal('testSchema4');
        return function(dataToValidate) {
          testFlag = true;
          return ajv.validate(ajvSchemaId, dataToValidate);
        };
      }
      
      validator.addCustomValidator('testSchema4', customValidator);
      expect(function() {
        validator.validate.testSchema4(invalidData);
      }).to.not.throw(ValidationError);
      expect(testFlag).to.equal(true);
    });
  });
  
});
