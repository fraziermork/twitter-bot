const _     = require('lodash');
const debug = require('debug')('tb:mockTweets');
// const utils = require('utils');

// Contains mock tweet data to use 
// tweet docs:  https://dev.twitter.com/overview/api/tweets
// entity docs: https://dev.twitter.com/overview/api/entities-in-twitter-objects
const mockTweets = {
  authenticatedUser: {}, 
  otherUser:     {},
  
  templateTweet: {
    contributors:              null, 
    coordinates:               null, 
    created_at:                null,
    favorite_count:            0, 
    favorited:                 false, 
    filter_level:              'medium',
    lang:                      'en',
    retweet_count:             0, 
    retweeted:                 false,
    source:                    'web',
    text:                      '', 
    truncated:                 false, 
    user:                      null,
    
    id:                        null, 
    id_str:                    null,
    in_reply_to_screen_name:   null,
    in_reply_to_status_id:     null,
    in_reply_to_status_id_str: null,
    in_reply_to_user_id:       null,
    in_reply_to_user_id_str:   null,
    
    entities: {
      // see https://dev.twitter.com/overview/api/entities-in-twitter-objects
      hashtags:          [], 
      media:             [],
      symbols:           [],
      urls:              [],
      user_mentions:     [],
      // extended_entities: [],
    },
    
    // Quoted tweets only 
    // quoted_status_id: null,
    // quoted_status_id_str: null,
    // quoted_status: {},
    
    
    // Can be ignored for now: 
    // 
    // deprecated 
    // geo: null,
    // 
    // indicates place, if any, irrellevant for now 
    // see https://dev.twitter.com/overview/api/places
    // place: null,
    // 
    // Only shows up if tweet contains link, irrellevant for now 
    // possibly_sensitive: false, 
    // 
    // Can be ignored for now 
    // scopes: {},
    // 
    // Full tweet, only present on retweets 
    // retweeted_status: {},
    // 
    // Info about info that is unavailable 
    // withheld_copyright: false, 
    // withheld_in_countries: [],
    // withheld_scope: 'status',
  },
   
   
  /**   
   * setDefaultUser - Sets the user objects the mock tweets are based on 
   *    
   * @param  {object} user - A twitter user object 
   * @param  {boolean} authenticatedUserFlag - If true, sets mockTweets.authenticatedUser, otherwise sets mockTweets.otherUser  
   */   
  setDefaultUser(user, authenticatedUserFlag) {
    const userKey = authenticatedUserFlag ? 'authenticatedUser' : 'otherUser';
    debug('setDefaultUser');
    _.assign(mockTweets[userKey], user);
  },
  
   
  /**   
   * generic - Factory function for generic tweets 
   *    
   * @param  {string} text    - The text of the tweet 
   * @param  {object} [user]  - The user the the tweet came from, if not mockTweet.otherUser
   * @return {object}         - A mock tweet object 
   */   
  generic(text, user) {
    const genericTweet = _.defaultsDeep({}, mockTweets.templateTweet);
    
    genericTweet.created_at = (new Date()).toUTCString();
    genericTweet.text       = text;
    genericTweet.user       = user || mockTweets.otherUser;
    
    // Using Date.now() as a simple way to generate largeish, unique numbers 
    genericTweet.id         = Date.now();
    genericTweet.id_str     = genericTweet.id.toString();
    
    return genericTweet;
  },
  
  
  
  /**  
   * mention - Generate a mock mention of the authenticated user 
   *    
   * @param  {string} text - The text of the tweet mentioning the authenticated user
   * @return {object}      - A mock tweet object 
   */   
  mention(text) {
    const authenticatedUser = mockTweets.authenticatedUser;
    const baseTweet         = mockTweets.generic(`@${authenticatedUser.screen_name} ${text}`);
    
    // Add mention entity 
    baseTweet.entities.user_mentions.push({
      screen_name: authenticatedUser.screen_name, 
      name:        authenticatedUser.name, 
      id:          authenticatedUser.id, 
      id_str:      authenticatedUser.id_str, 
      indices:     [0, authenticatedUser.screen_name + 1],
    });
    
    return baseTweet;
  },
  
  /**  
   * reply - Generate a mock reply to the authenticated user 
   * @todo: figure out whether the in_reply_to_user_id_str fields set for both mentions and replies, or just replies    
   * @param  {string} text             - The text of the tweet mentioning the authenticated user
   * @param  {object} [tweetRepliedTo] - Tweet object this reply is in response to, otherwise fields dependent on that get set to null
   * @return {object}                  - A mock tweet object 
   */ 
  reply(text, tweetRepliedTo = {}) {
    const authenticatedUser = mockTweets.authenticatedUser;
    const baseTweet = mockTweets.mention(text);
    
    baseTweet.in_reply_to_screen_name   = authenticatedUser.screen_name;
    baseTweet.in_reply_to_user_id       = authenticatedUser.id;
    baseTweet.in_reply_to_user_id_str   = authenticatedUser.id_str;
    baseTweet.in_reply_to_status_id     = tweetRepliedTo.id || null;
    baseTweet.in_reply_to_status_id_str = tweetRepliedTo.id_str || null;
    
    return baseTweet;
  },
  
  
  
  // retweet() {
  //   
  // },
  // textMatch() {
  //   
  // },
  
  
  
};

module.exports = mockTweets;
