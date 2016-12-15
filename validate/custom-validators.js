// npm modules 
const debug = require('debug')('tb:custom-validators');
const Twit  = require('twit');
const _     = require('lodash');


/**  
 * Each custom validator has to fit this schema: 
 * 
 * schemaFilenameToCamelCase - The custom validator function 
 *    
 * @param  {object} ajv            - An instance of Ajv  
 * @param  {*}      dataToValidate - The data to validate 
 * @return {boolean}               - The results of the validation 
 */
const customValidators = {
  configureTwitterBotOptions,
};
module.exports = customValidators;

/**
 * configurationOptions - Validates the options passed into configure, which sets up the options for the TwitterBot constructor
 *                        This is needed to force the key 'Twit' to default to the Twit library, which isn't possible with ajv alone  
 * 
 * @TODO: Figure out how to do custom errors with ajv 
 * @param  {object} ajv         - An instance of Ajv  
 * @param  {type}   configOpts  - The options to for the configure function
 * @return {boolean}            - The results of the ajv validation 
 */ 
function configureTwitterBotOptions(ajv, configOpts) {
  const defaultConfigurationOptions = {
    Twit, 
  };
  
  const optsAreValid = ajv.validate('configureTwitterBotOptions', configOpts);
  _.defaultsDeep(configOpts, defaultConfigurationOptions);
  return optsAreValid;
}
