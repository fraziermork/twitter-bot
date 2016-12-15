/** @module validate */

// npm modules 
const debug       = require('debug')('tb:validate');
const Ajv         = require('ajv');
const ajvKeywords = require('ajv-keywords');
const _           = require('lodash');

// internal modules 
const customValidators = require('./custom-validators');

// Default options for the validate module itself 
const defaultValidateOptions = {
  Ajv,
  customValidators, 
  
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
 * constructValidate - description
 *  
 * @param  {object} schemas           - All schemas with the key designating the schema's name 
 * @param  {object} [validateOptions] - Options to configure validate 
 * @return {object}                   - All schema validators organized by the name of what they validate 
 */ 
function constructValidate(schemas, validateOptions = {}) {
  debug('constructValidate', validateOptions);
  const options = _.defaultsDeep({}, validateOptions, defaultValidateOptions);
  const ajv     = new options.Ajv(options.ajvOptions);
  if (options.enableAjvKeywords) ajvKeywords(ajv);
  
  // Set up the default validator functions 
  const validate = _initializeSchemasAndConstructDefaultValidators(schemas, ajv, {});

  // Overwrite the default validators with the custom ones 
  _attachCustomValidators(options.customValidators, ajv, validate);
  
  return validate;
}




/**
 * _initializeSchemasAndConstructDefaultValidators - Registers all schemas with ajv and constructs default validators 
 *  
 * @param  {object} schemas  - All schemas organized by name
 * @param  {object} ajv      - An instance of ajv
 * @param  {object} validate - The object to store the validator functions on
 * @return {validate}
 */ 
function _initializeSchemasAndConstructDefaultValidators(schemas, ajv, validate) {
  const schemaNames = Object.keys(schemas);
  schemaNames.forEach((schemaName) => {
    // Register the schema with ajv 
    ajv.addSchema(schemas[schemaName], schemaName);
    
    // attach default validator 
    validate[schemaName] = _defaultValidator;
    
    /**    
     * _defaultValidator - description    
     *      
     * @param  {*} dataToValidate - The data to validate against the schema 
     * @return {boolean}          - The results of the ajv validation 
     */     
    function _defaultValidator(dataToValidate) {
      return ajv.validate(schemaName, dataToValidate);
    }
  });
  
  return validate;
}




/**
 * _attachCustomValidators - Overwrites the default validators with the ones that need to be customized. 
 *                           Makes it possible to separate the custom validators and pass them the same ajv instance 
 *  
 * @param  {object} customValidators - All the custom validators organized by name
 * @param  {object} ajv              - An instance of Ajv  
 * @param  {object} validate         - The object to store the validator functions on
 * @return {validate}
 */ 
function _attachCustomValidators(customValidators, ajv, validate) {
  const validatorNames = Object.keys(customValidators);
  validatorNames.forEach((validatorName) => {
    validate[validatorName] = _customValidator;
    
    /**    
     * _customValidator - Attaches a custom validator to validate and injects the ajv instance 
     *      
     * @param  {*} dataToValidate - The data to validate against the schema 
     * @return {boolean}          - The results of the custom validation 
     */     
    function _customValidator(dataToValidate) {
      return customValidators[validatorName](ajv, dataToValidate);
    }
  });
  return validate;
}
