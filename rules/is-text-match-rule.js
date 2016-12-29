// const utils    = require('../lib/utils');
const _        = require('lodash');

module.exports = textMatch;



/**
 * textMatch - Checks whether a tweet has the specified text 
 *  
 * @param  {object} tweet   - A tweet object 
 * @param  {object} context - The context object for the rules to store information on if necessary. All matches results will be stored on the context object.  
 * @param  {object} options - Options for this rule
 * @prop   {string} search  - The string to search for. Required. @see {@link https://dev.twitter.com/rest/public/search}
 * @return {promise}        - A promise that resolves with a boolean indicating whether the sp
 */ 
function textMatch(tweet, context, options) {
  if (!options.search) throw new Error('textMatch rule requires a string to search for.');
  
  
  
  
}
