/**
 * All the validator functions that need to be customized to do something that ajv can't handle by itself. 
 * 
 * Each custom validator must match this schema: 
 * 
 * schemaFilenameToCamelCase - The custom validator function 
 *    
 * @param  {object} ajv            - An instance of Ajv  
 * @param  {*}      dataToValidate - The data to validate 
 * @return {boolean}               - The results of the validation 
 * 
 * @module custom-validators 
 */ 

// npm modules 
const debug           = require('debug')('tb:custom-validators');
const Twit            = require('twit');
const _               = require('lodash');

// internal modules 
const ValidationError = require('./validation-error');


/**
 * All custom validators, organized by schema name 
 */ 
const customValidators = {
  configureTwitterBotOptions,
};

module.exports = customValidators;

/**
 * configurationOptions - Validates the options passed into configure, which sets up the options for the TwitterBot constructor
 *                        This is needed to force the key 'Twit' to default to the Twit library, which isn't possible with ajv alone  
 * 
 * @todo: Figure out how to do custom errors with ajv 
 * @param  {object} ajv         - An instance of Ajv  
 * @param  {object} configOpts  - Options for configureTwitterBot 
 * @param  {string} ajvSchemaId - The name of the schema stored with ajv 
 * @return {boolean}            - The results of the ajv validation 
 */ 
function configureTwitterBotOptions(ajv, ajvSchemaId) {
  debug(ajvSchemaId);
  const defaultConfigureTwitterBotOptions = {
    Twit, 
  };
  
  return function(dataToValidate) {
    const valid = ajv.validate(ajvSchemaId, dataToValidate);
    if (!valid) throw new ValidationError(ajvSchemaId, ajv.errors); 
    _.defaultsDeep(dataToValidate, defaultConfigureTwitterBotOptions);
    return valid;
  };
}
