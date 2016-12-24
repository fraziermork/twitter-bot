const utils    = require('../lib/utils');

module.exports = {
  ruleName:       'isMention', 
  check:          isMention, 
  defaultOptions: { expect: true }, 
  isMetaRule:     false, 
};

/**
 * isMention - Determines whether a tweet is a mention of a user
 *  
 * @param  {object} tweet         - A tweet object 
 * @param  {object} context       - The context object for the rules to store information on if necessary 
 * @param  {object} options       - Options for this rule
 * @prop   {object} mentionedUser - The user to look for mentions of. Defaults to the authenticated user. 
 * @return {promise}              - A promise that resolves with a boolean to indicate whether the tweet is a mention or rejects with an error 
 */ 
function isMention(tweet, context, options) {
  const userToLookForMentionsOf = options.mentionedUser || utils._accountInfo.res;
  return new Promise((resolve, reject) => {
    if (!tweet.entities || !tweet.entities.user_mentions) return resolve(false);
    const mentions = tweet.entities.user_mentions;
    try {
      // Iterate through all mention entities and see if the ids match 
      // TODO: Need to change rule in case they set include_entities to false in twit options? 
      for (let i = 0; i < mentions.length; i++) {
        if (mentions[i].id_str === userToLookForMentionsOf.id_str) return resolve(true);
      }
      return resolve(false);
      
    } catch (err) {
      return reject(err);
    }
  });
}
