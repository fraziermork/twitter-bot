// npm modules 
const debug             = require('debug')('tb:test-validate');
const chai              = require('chai');
const Twit              = require('twit');

// internal modules 
const constructValidate = require('../lib/validate');
const ValidationError   = require('../lib/validation-error');

const expect            = chai.expect;

describe('validate', function() {
  it('should throw an error if validateOptions.Ajv is not a function', function() {
    const badValidateOptions = {
      Ajv: {},
    };
    
    expect(function() {
      constructValidate(badValidateOptions);
    }).to.throw(TypeError);
  });
  
  it('should accept custom schemas on validateOptions', function() {
    const testSchema = {
      type: 'object', 
      id:   'testSchema',
      
      properties: {
        testing: {
          type: 'string',
        },
      },
      required: ['testing'],
    };
    
    const validateOptionsWithTestSchema = {
      schemas: {
        testSchema,
      },
    };
    
    const testSchemaMatch = {
      testing: 'hello world',
    };
    
    const testSchemaMismatch = {
      testing: 123,
    };
    
    const validate = constructValidate(validateOptionsWithTestSchema);
    
    debug(validate);
    
    expect(validate).to.have.property('testSchema');
    
    expect(validate.testSchema(testSchemaMatch)).to.equal(true);
    expect(function() {
      validate.testSchema(testSchemaMismatch);
    }).to.throw(ValidationError);
    
  });
  
  
  describe('custom validators', function() {
    beforeEach('Attach validate', function() {
      this.validate = constructValidate();
    });
    
    it('should run default validators successfully', function() {
      const validMockConfigureTwitterBotOptions = {};
      const valid    = this.validate.configureTwitterBotOptions(validMockConfigureTwitterBotOptions);
      expect(validMockConfigureTwitterBotOptions.Twit).to.equal(Twit);
      expect(valid).to.equal(true);
    });
    
    it('should should still throw errors if the data doesn\'t match the schema', function() {
      const invalidMockConfigureTwitterBotOptions = {
        Twit: 1,
      };
      
      expect(() => {
        this.validate.configureTwitterBotOptions(invalidMockConfigureTwitterBotOptions);
      }).to.throw(ValidationError);
    });
    
  });  
  
});
