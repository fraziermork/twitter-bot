const utils    = require('../lib/utils');

module.exports = {
  ruleName:       'isRetweet', 
  check:          isRetweet, 
  defaultOptions: { expect: true }, 
  isMetaRule:     false, 
};

/**
 * isRetweet - Determines whether a tweet is a reply to a tweet by the authenticated user
 *  
 * @param  {object} tweet   - A tweet object 
 * @param  {object} context - The context object for the rules to store information on if necessary 
 * @param  {object} options - Options for this rule
 * @return {promise}        - A promise that resolves with a boolean to indicate whether the tweet is a reply or rejects with an error 
 */ 
function isRetweet(tweet, context, options) {
  return new Promise((resolve, reject) => {
    try {
      // If it has a retweeted_status, it's a retweet. 
      // TODO: Confirm that this is actually the way to do this check. 
      if (tweet.retweeted_status && typeof tweet.retweeted_status === 'object') return resolve(true);
      return resolve(false);
    } catch (err) {
      return reject(err);
    }
  });
}
