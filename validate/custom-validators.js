const debug = require('debug')('tb:custom-validators');
const Twit  = require('twit');
const _     = require('lodash');


/**  
 * Each custom validator has to fit this schema: 
 * 
 * schemaFilenameToCamelCase - The custom validator function 
 *    
 * @param  {object} ajv          - An instance of Ajv  
 * @param  {*}    dataToValidate - The data to validate 
 * @return {boolean}             - The results of the validation 
 */
const customValidators = {
  configureOptions,
};
module.exports = customValidators;

/**
 * configurationOptions - Validates the options passed into configure, which sets up the options for the TwitterBot constructor
 *                        This is needed to force the key 'Twit' to default to the Twit library, which isn't possible with ajv alone  
 * 
 * @TODO: Figure out how to do custom errors with ajv 
 * @param  {object} ajv         - An instance of Ajv  
 * @param  {type} configureOpts - The options to for the configure function
 * @return {boolean}            - The results of the ajv validation 
 */ 
function configureOptions(ajv, configureOpts) {
  const defaultConfigurationOptions = {
    Twit, 
  };
  
  const optsAreValid = ajv.validate('configureOptions', configureOpts);
  _.defaultsDeep(configureOpts, defaultConfigurationOptions);
  return optsAreValid;
}
