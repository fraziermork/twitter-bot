/**
 * @module validator
 * @private 
 */ 

// npm modules 
// const debug                  = require('debug')('tb:validator');
const Ajv                    = require('ajv');
const ajvKeywords            = require('ajv-keywords');

// internal modules 
const customValidators       = require('./custom-validators');
const schemas                = require('../validator-schemas');
const ValidationError        = require('./validation-error');

function Validator() {
  // Ajv instance to use for internal validation 
  this.ajv = new Ajv({
    verbose:     true, 
    allErrors:   true, 
    v5:          true, 
    useDefaults: true, 
    coerceType:  'array',
  });
  ajvKeywords(this.ajv);
  
  // Namespace for validation methods 
  this.validate = {};
  
}


Validator.prototype.addSchema               = addSchema;
Validator.prototype.addCustomValidator      = addCustomValidator;
Validator.prototype.addSchemasAndValidators = addSchemasAndValidators;

module.exports = (function() {
  const validator = new Validator();
  validator.addSchemasAndValidators(schemas, customValidators);
  return validator;
})();



/**
 * addSchema - Registers a schema with ajv and attaches the default validator 
 * @todo do some sort of handling in case the schema has already been registered?  
 * @param  {string} schemaName The name of that schema 
 * @param  {object} schema     The schema to register 
 */ 
function addSchema(schemaName, schema) {
  // debug(`addSchema ${schemaName}`);
  if (!schema.id) schema.id = schemaName;
  this.ajv.addSchema(schema);
  this.validate[schemaName] = _defaultValidator(this.ajv, schema.id);
}


/**
 * addCustomValidator - Attaches custom validators in case there is something that ajv can't do, like handle a function as a default value
 *  
 * @param  {string}   schemaName          The name of correspondingSchema
 * @param  {object}   correspondingSchema The schema that the custom validator corresponds to 
 * @param  {function} validator           The custom validator function 
 */ 
function addCustomValidator(schemaName, correspondingSchema, validator) {
  // debug(`addCustomValidator for ${correspondingSchema.id}`);
  this.validate[schemaName] = validator(this.ajv, correspondingSchema.id);
}


/**
 * addSchemasAndValidators - Attaches schemas and validators 
 *  
 * @param  {object} schemas          An object containing all schemas, organized by name 
 * @param  {object} customValidators An object with all custom validation functions, with the same key as the schema they belong to on schemas 
 */ 
function addSchemasAndValidators(schemas, customValidators) {
  // debug('addSchemasAndValidators');
  const schemaNames = Object.keys(schemas);
  schemaNames.forEach((schemaName) => {
    this.addSchema(schemaName, schemas[schemaName]);
    if (customValidators[schemaName]) {
      this.addCustomValidator(schemaName, schemas[schemaName], customValidators[schemaName]);
    }
  });
}


/**    
 * _defaultValidator - The default validator function if customization isn't necessary 
 * 
 * @param  {object} ajv         - The ajv instance    
 * @param  {string} ajvSchemaId - The string key the schema has been registered with ajv as 
 * @return {defaultValidator} 
 */     
function _defaultValidator(ajv, ajvSchemaId) {
  /**  
   * @name defaultValidator 
   * @throws {ValidationError} - throws a validation error if the data did not match the corresponding schema  
   */   
  return (dataToValidate) => {
    const valid = ajv.validate(ajvSchemaId, dataToValidate);
    if (!valid) throw new ValidationError(ajvSchemaId, ajv.errors);
  };
}
