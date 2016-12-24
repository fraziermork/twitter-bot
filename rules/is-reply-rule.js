const utils    = require('../lib/utils');

module.exports = {
  ruleName:       'isReply', 
  check:          isReply, 
  defaultOptions: { expect: true }, 
  isMetaRule:     false, 
};

/**
 * isReply - Determines whether a tweet is a reply to a tweet by the authenticated user
 *  
 * @param  {object} tweet   - A tweet object 
 * @param  {object} context - The context object for the rules to store information on if necessary 
 * @param  {object} options - Options for this rule
 * @return {promise}        - A promise that resolves with a boolean to indicate whether the tweet is a reply or rejects with an error 
 */ 
function isReply(tweet, context, options) {
  return new Promise((resolve, reject) => {
    try {
      if (tweet.in_reply_to_user_id_str === utils._accountInfo.res.id_str) {
        return resolve(true);
      }
      return resolve(false);
    } catch (err) {
      return reject(err);
    }
  });
}
