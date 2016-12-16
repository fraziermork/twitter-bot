/**
 * ValidationError 
 * Produces custom error messages for failed schema validations
 * @module validation-error 
 * @private 
 */ 
 
// const debug = require('debug')('tb:validation-error');
 
module.exports = ValidationError;
 
 
 
 /** 
  * ValidationError - Constructor for custom validation errors based on [error constructor in Webpack 2.0]{@link https://github.com/webpack/webpack/blob/master/lib/WebpackOptionsValidationError.js}
  * @constructor   
  * @todo implement more readable error messages
  * @param {string} ajvSchemaId - The name of the schema that validation failed against 
  * @param {array} ajvErrors    - The errors from ajv 
  */  
function ValidationError(ajvSchemaId, ajvErrors) {
  Error.call(this);
  Error.captureStackTrace(this, ValidationError);
  this.name = 'ValidationError';
 
  let formattedErrorMessages = ajvErrors.map((err) => {
    return `Error in ${ajvSchemaId}${err.dataPath}. Message: ${err.message}.`;
  })
    .join('\n');
 
  this.message = `Validation Error:\n${formattedErrorMessages}`;
}

ValidationError.prototype             = Object.create(Error.prototype);
ValidationError.prototype.constructor = ValidationError;
