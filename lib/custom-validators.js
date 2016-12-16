/**
 * All the validator functions that need to be customized to do something that ajv can't handle by itself. 
 * 
 * Each custom validator must match this schema: 
 * 
 * schemaFilenameToCamelCase - The custom validator function 
 *    
 * @param  {object} ajv            - An instance of Ajv  
 * @param  {string} ajvSchemaId    - The id of the schema being checked 
 * @return {function}              - A function that takes a single argument, the data to validate, and returns true or throws a ValidationError
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
 * @param  {string} ajvSchemaId - The ajv id of the schema 
 * @return {function}           - The results of the ajv validation 
 * @throws {ValidationError}    - Throws an error if the validation fails 
 */ 
function configureTwitterBotOptions(ajv, ajvSchemaId) {
  debug(ajvSchemaId);
  const defaultConfigureTwitterBotOptions = {
    Twit, 
  };
  
  /**  
   * The custom validator function for the configureTwitterBotOptions schema 
   *    
   * @param  {type} dataToValidate The data to validate against the configureTwitterBot schema    
   * @return {boolean}             Whether the validation was successful 
   */   
  return function(dataToValidate) {
    const valid = ajv.validate(ajvSchemaId, dataToValidate);
    if (!valid) throw new ValidationError(ajvSchemaId, ajv.errors); 
    _.defaultsDeep(dataToValidate, defaultConfigureTwitterBotOptions);
    return valid;
  };
}
