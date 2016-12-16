/**
 * @module validate
 */ 

// npm modules 
const debug                  = require('debug')('tb:validate');
const Ajv                    = require('ajv');
const ajvKeywords            = require('ajv-keywords');
const _                      = require('lodash');

// internal modules 
const customValidators       = require('./custom-validators');
const schemas                = require('../validator-schemas');
const ValidationError        = require('./validation-error');

// Default options for the validate module itself 
const defaultValidateOptions = {
  Ajv,
  customValidators, 
  schemas, 
  
  ajvOptions: {
    verbose:     true, 
    allErrors:   true, 
    v5:          true, 
    useDefaults: true, 
    coerceType:  'array',
  },
  enableAjvKeywords: true, 
};

module.exports = constructValidate;

/**
 * constructValidate - Constructs the validator object.  
 *  
 * @param  {object}   [validateOptions]                 - Options to configure validate 
 * @prop   {function} validateOptions.Ajv               - Constructor function to use for Ajv, mostly used if a mock version is being used for testing 
 * @prop   {object}   validateOptions.ajvOptions        - Options for the ajv instance that the validators will use 
 * @prop   {object}   validateOptions.schemas           - All schemas with the key designating the schema's name 
 * @prop   {object}   validateOptions.customValidators  - The custom validators to use, with the same key as the schema they correspond to 
 * @prop   {boolean}  validateOptions.enableAjvKeywords - Whether to use ajv-keywords 
 * @return {object}                                     - All schema validators organized by the name of what they validate 
 */ 
function constructValidate(validateOptions = {}) {
  debug('constructValidate', validateOptions);
  
  // Have to handle validation here for myself 
  const options = _.defaultsDeep({}, validateOptions, defaultValidateOptions);
  if (!options.Ajv || typeof options.Ajv !== 'function') throw new TypeError('Validate options.Ajv must be a constructor function.');
  
  // Set up ajv instance 
  const ajv     = new options.Ajv(options.ajvOptions);
  if (options.enableAjvKeywords) ajvKeywords(ajv);

  /** 
   * validate - The validate module. 
   * Named validate instead of validator so calling its methods reads like english. 
   */
  const validate = _initializeSchemasAndValidators(options.schemas, options.customValidators, ajv, {});
  
  return validate;
}




/**
 * _initializeSchemasAndConstructDefaultValidators - Registers all schemas with ajv and constructs default validators 
 * @private 
 * @param  {object} schemas  - All schemas organized by name
 * @param  {object} customValidators - All the custom validators organized by name
 * @param  {object} ajv      - An instance of ajv
 * @param  {object} validate - The object to store the validator functions on
 * @return {validate}
 */ 
function _initializeSchemasAndValidators(schemas, customValidators, ajv, validate) {
  const schemaNames = Object.keys(schemas);
  schemaNames.forEach((schemaName) => {
    let schema = schemas[schemaName];
    let ajvSchemaId = schema.id;
    if (!ajvSchemaId) {
      ajvSchemaId = schema.id = schemaName;
    }
    
    // Register the schema with ajv 
    ajv.addSchema(schemas[schemaName]);
    
    // Check whether to attach the default validator or a custom one 
    if (customValidators[schemaName]) {
      // debug(`Attaching ${schemaName} with id ${ajvSchemaId}`);
      validate[schemaName] = customValidators[schemaName](ajv, ajvSchemaId);
    } else {
      validate[schemaName] = _defaultValidator;
    }
    
    /**    
     * _defaultValidator - The default validator function if customization isn't necessary 
     *      
     * @param  {*} dataToValidate - The data to validate against the schema 
     * @return {boolean}          - The results of the ajv validation 
     */     
    function _defaultValidator(dataToValidate) {
      const valid = ajv.validate(ajvSchemaId, dataToValidate);
      if (!valid) throw new ValidationError(ajvSchemaId, ajv.errors);
      return valid;
    }
  });
  
  return validate;
}
