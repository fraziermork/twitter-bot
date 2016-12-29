// npm modules 
const debug   = require('debug')('tb:mock');
const regexps = require('twitter-regexps');
const _       = require('lodash');

/**
 * mock - Contains methods to mock tweet data 
 * @see {@link https://dev.twitter.com/overview/api/tweets}
 */ 
const mock = {
  
  /*
  ██    ██ ███████ ███████ ██████
  ██    ██ ██      ██      ██   ██
  ██    ██ ███████ █████   ██████
  ██    ██      ██ ██      ██   ██
   ██████  ███████ ███████ ██   ██
  */
  
  /**  
   * user - Holds and manages the mock users
   */   
  user: {
    current: {}, 
    other:   {},
    
    /**   
     * setUser - Sets the value of the mock users 
     *    
     * @param  {object} user    - A twitter user object 
     * @param  {string} userKey - The key to store the user object on mock.user as, defaults to current. 'other' should also commonly be used. 
     */   
    setUser(user, userKey) {
      userKey = userKey ? userKey : 'current';
      debug('setDefaultUser');
      _.assign(mock.user[userKey] || {}, user);
    },
    
  },
  
  
  
  
  
  
  
  /*
  ████████ ██     ██ ███████ ███████ ████████
     ██    ██     ██ ██      ██         ██
     ██    ██  █  ██ █████   █████      ██
     ██    ██ ███ ██ ██      ██         ██
     ██     ███ ███  ███████ ███████    ██
  */
  
  /**  
   * tweet - Contains all mock tweet generation methods   
   */   
  tweet: {
    
    /**  
     * _template - The template tweet others are generated from 
     */   
    _template: {
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
        hashtags:          [], 
        media:             [],
        symbols:           [],
        urls:              [],
        user_mentions:     [],
        // extended_entities: [],
      },
      
      // // Retweets only 
      // retweeted_status: {},
      
      // // Quoted tweets only:
      //  
      // quoted_status_id:     null,
      // quoted_status_id_str: null,
      // quoted_status:        {},
      
      
      // // Can be ignored for now: 
      // 
      // // deprecated 
      // geo: null,
      // 
      // // indicates place, if any
      // // see https://dev.twitter.com/overview/api/places
      // place: null,
      // 
      // // Only shows up if tweet contains link
      // possibly_sensitive: false, 
      // 
      // // Not sure what this does 
      // scopes: {},
      // 
      // // Info about whether unavailable 
      // withheld_copyright: false, 
      // withheld_in_countries: [],
      // withheld_scope: 'status',
    },
    
    
    /**   
    * generic - Factory function for generic tweets 
    *    
    * @param  {string} text    - The text of the tweet 
    * @param  {object} [user]  - The user the the tweet came from, if not mockTweet.otherUser
    * @return {object}         - A mock tweet object 
    */   
    generic(text, user) {
      const genericTweet      = _.defaultsDeep({}, mock.tweet._template);
      
      genericTweet.created_at = (new Date()).toUTCString();
      genericTweet.text       = text;
      genericTweet.user       = user || mock.user.other;
      
      // Using Date.now() as a simple way to generate largeish, unique numbers 
      genericTweet.id         = Date.now();
      genericTweet.id_str     = genericTweet.id.toString();
      
      // Add in the entities 
      mock.entity.addEntities(genericTweet);
      
      return genericTweet;
    },
    
    
    /**  
    * mention - Generate a mock mention of a user
    * @todo Figure out whether mentions need to have any other properties set on them  
    *    
    * @param  {string} text        - The text of the tweet mentioning the authenticated user
    * @param  {object} [user]      - The user to mention, defaults to mock.user.current
    * @param  {object} [otherUser] - The user who made the tweet. Defaults to mock.user.other
    * @return {object}             - A mock tweet object 
    */   
    mention(text, user, otherUser) {
      const currentUser = user ? user : mock.user.current;
      const baseTweet   = mock.tweet.generic(`@${currentUser.screen_name} ${text}`, otherUser);
        
      return baseTweet;
    },
    
    
    /**  
    * reply - Generate a mock reply to the authenticated user 
    * @todo: figure out whether the in_reply_to_user_id_str fields set for both mentions and replies, or just replies
    *     
    * @param  {string} text             - The text of the tweet replying to the authenticated user
    * @param  {object} [tweetRepliedTo] - Tweet object this reply is in response to, otherwise fields dependent on that get set to null
    * @return {object}                  - A mock tweet object 
    */ 
    reply(text, tweetRepliedTo = {}) {
      const currentUser = mock.user.current;
      const baseTweet   = mock.tweet.mention(text);
      
      baseTweet.in_reply_to_screen_name   = currentUser.screen_name;
      baseTweet.in_reply_to_user_id       = currentUser.id;
      baseTweet.in_reply_to_user_id_str   = currentUser.id_str;
      baseTweet.in_reply_to_status_id     = tweetRepliedTo.id || null;
      baseTweet.in_reply_to_status_id_str = tweetRepliedTo.id_str || null;
      
      return baseTweet;
    },
    
    
    
    /**    
     * retweet - Creates a mock retweet 
     *      
     * @param  {object} statusToRetweet - A tweet object that should be retweeted
     * @param  {object} user            - The user to retweet the message. Defaults to mock.user.other
     * @return {object}                 - A mock tweet object that is a retweet of statusToRetweet
     */     
    retweet(statusToRetweet, user) {
      const retweet            = mock.tweet.generic(null, user);
      retweet.retweeted_status = statusToRetweet;
      // Not sure how entities handled with retweets 
      // retweet.entities         = statusToRetweet.entities;
      return retweet;
    },
  },
  
  
  
  
  
  
  
  
  /*
  ███████ ███    ██ ████████ ██ ████████ ██    ██
  ██      ████   ██    ██    ██    ██     ██  ██
  █████   ██ ██  ██    ██    ██    ██      ████
  ██      ██  ██ ██    ██    ██    ██       ██
  ███████ ██   ████    ██    ██    ██       ██
  */
  
  /**  
   * entity - Contains all mock entity generation methods 
   * @see {@link https://dev.twitter.com/overview/api/entities-in-twitter-objects}
   */   
  entity: {
    
    /**    
     * addEntities - Takes a tweet object and adds entities, currently only adds hashtag and mention entities  
     *      
     * @param  {object} tweet - The tweet object to add entities to 
     * @return {object}       - The modified tweet object with entities added 
     */     
    addEntities(tweet) {
      mock.entity._addHashtags(tweet);
      mock.entity._addUserMentions(tweet);
      return tweet;
    },
    
    
    
    /**    
     * _addHashtags - Processes a tweet object for hashtags with regex 
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec#Finding_successive_matches}
     *      
     * @param  {object} tweet - The tweet object to add hashtag entities to 
     * @return {object}       - The modified tweet object with hashtag entities added 
     */     
    _addHashtags(tweet) {
      let hashtagMatches;
      const tweetText = tweet.text;
      const hashtags  = tweet.entities.hashtags;
      if (!tweetText) return;
      
      // Label while loop so that can reach it from inside for loop 
      matchloop:
      while((hashtagMatches = regexps.hashtag.exec(tweetText)) !== null) {
        // Ensure that there isn't already an entity for that hashtag 
        for (let i = 0; i < hashtags.length; i++) {
          if (hashtags[i].indices[0] === hashtagMatches.index) {
            continue matchloop;
          }
        }
        
        // Create the hashtag and push it into the entities array 
        tweet.entities.hashtags.push(mock.entity.hashtag(hashtagMatches[0], hashtagMatches.index));
      }
      
      return tweet;
    },
    
    
    /**    
     * _addUserMentions - Processes a tweet object for user mentions with regex 
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec#Finding_successive_matches}
     *      
     * @param  {object} tweet - The tweet object to add hashtag entities to 
     * @return {object}       - The modified tweet object with hashtag entities added 
     */
    _addUserMentions(tweet) {
      let userMentionMatches;
      const tweetText    = tweet.text;
      const userMentions = tweet.entities.user_mentions;
      const userKeys     = ['current', 'other'];
      if (!tweetText) return;
      
      // Label while loop so that can reach it from inside for loop 
      matchloop:
      while((userMentionMatches = regexps.mention.exec(tweetText)) !== null) {
        // Ensure that there isn't already an entity for that mention
        for (let i = 0; i < userMentions.length; i++) {
          if (userMentions[i].indices[0] === userMentionMatches.index) {
            continue matchloop;
          }
        }
        
        // Find corresponding user 
        let mentionedScreenName = userMentionMatches[0].slice(1);
        let userToMention       = null;
        for (let j = 0; j < userKeys.length; j++) {
          if (mock.user[userKeys[j]].screen_name === mentionedScreenName) {
            userToMention = mock.user[userKeys[j]];
            break;
          }
        }
        
        // If corresponding mock user not found, mock enough data for mock.entity.userMention to use 
        if (!userToMention) {
          console.warn(`Could not find mock user corresponding to mention ${userMentionMatches[0]}`);
          let dummyId   = Date.now();
          userToMention = {
            id:          dummyId, 
            id_str:      dummyId.toString(), 
            name:        mentionedScreenName, 
            screen_name: mentionedScreenName, 
          };
        }
        
        // Create the hashtag and push it into the entities array 
        tweet.entities.user_mentions.push(mock.entity.userMention(userToMention, userMentionMatches.index));  
      }
      
      return tweet;
    },
    
    /**    
     * hashtag - Factory function for hashtag entity objects 
     *      
     * @param  {string} hashtagText - The text of the hashtag with or without the # 
     * @param  {number} startIndex  - The index in the text of the tweet where the hashtag starts 
     * @return {object}             - The hashtag entity object 
     */     
    hashtag(hashtagText, startIndex) {
      if (hashtagText.startsWith('#')) hashtagText = hashtagText.slice(1);
      return {
        text:    hashtagText, 
        indices: [
          startIndex, 
          (hashtagText.length + 1),
        ],
      };
    }, 
    
    
    /**    
     * userMention - Factory function for user_mention entity objects 
     *      
     * @param  {object} options.user       - The twitter user object of the user that was mentioned. Defaults to mock.user.current. 
     * @param  {number} options.startIndex - The index that the user mention starts at, defaults to 0
     * @return {object}                    - A user_mention entity object, assuming that the mention was the first thing in the tweet  
     */     
    userMention(user, startIndex) {
      user       = user ? user : mock.user.current;
      startIndex = startIndex ? startIndex : 0;
      return {
        id:          user.id, 
        id_str:      user.id_str, 
        screen_name: user.screen_name, 
        name:        user.name, 
        indices:     [startIndex, startIndex + user.screen_name.length + 1],
      };
    },
    
    // url() {
    //   
    // }, 
    
    // media() {
    //   
    // }, 
    
    // symbol() {
    //   
    // },
    
  },
  
  
  
  
  
  
  
  
  
  
  
  /*
   █████  ██████  ██     ██████  ███████ ███████ ██████   ██████  ███    ██ ███████ ███████
  ██   ██ ██   ██ ██     ██   ██ ██      ██      ██   ██ ██    ██ ████   ██ ██      ██
  ███████ ██████  ██     ██████  █████   ███████ ██████  ██    ██ ██ ██  ██ ███████ █████
  ██   ██ ██      ██     ██   ██ ██           ██ ██      ██    ██ ██  ██ ██      ██ ██
  ██   ██ ██      ██     ██   ██ ███████ ███████ ██       ██████  ██   ████ ███████ ███████
  */
  
  /**  
   * apiResponse - Contains all mock api response generation methods   
   */   
  apiResponse: {
  
    /**  
     * verifyCredentials - A mock response from GET account/verify_credentials 
     * @see {@link https://dev.twitter.com/rest/reference/get/account/verify_credentials}
     * 
     * @param  {object} options - An options object that can be used to customize fields, most likely name and screen_name    
     * @return {object}         - Mock response object   
     */   
    verifyCredentials(options) {
      const dummyId = Date.now();
      return _.defaultsDeep({}, options, {
        contributors_enabled:  false, 
        created_at:            (new Date()).toUTCString(), 
        default_profile:       false, 
        default_profile_image: false, 
        description:           'I am a dummy test account',
        favourites_count:      0, 
        follow_requests_sent:  0, 
        followers_count:       0, 
        following:             null, 
        friends_count:         0, 
        geo_enabled:           false, 
        id:                    dummyId, 
        id_str:                dummyId.toString(), 
        is_translator:         false, 
        lang:                  'en', 
        listed_count:          0, 
        location:              'earth', 
        name:                  '', 
        notifications:         null, 
        screen_name:           '', 
        statuses_count:        0, 
        url:                   null, 
        
        // ignoring properties: 
        // 
        // profile_* 
        // status 
        // time_zone 
        // utc_offset 
        // verified 
      });
    },
    
  },
  
};

module.exports = mock;
