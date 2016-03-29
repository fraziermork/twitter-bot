'use strict';
//Chai stuff
let chai        = require('chai');
let expect      = chai.expect;

//rewire the TwitterBot constructor to use a different set of API keys for the tests
let rewire      = require('rewire');
let Twit        = require('twit');
let testKeys    = require(__dirname + '/../config/test-config2.js'); //TODO: will need to be changed later
let twit        = new Twit(testKeys);
let TwitterBot  = rewire(__dirname + '/../lib/twitter-bot.js');
TwitterBot.__set__('twit', twit);

//declare the other user's twit
let secondTestKeys = require(__dirname + '/../config/test-config1.js');
let twit2 = new twit(secondTestKeys);
let twit2ScreenName;
let twit2UserId;

//declare twitterBot, the bot that we will be using for all of our tests
let twitterBot;

describe('twitter-bot.js', () => {
  
  describe('constructor function', (done) => {
    twitterBot = new TwitterBot();
    expect(twitterBot.twit).to.eql(twit);
    expect(twitterBot.SafeMode).to.equal(true);
    expect(twitterBot.RESTOnly).to.equal(false);
    expect(twitterBot.screen_name).to.equal(null);
    expect(twitterBot.user_id).to.equal(null);
    expect(twitterBot.classList).to.equal([]);
    expect(twitterBot.tweetIdsRepliedTo).to.equal([]);
    expect(twitterBot.tweetIdsThatMatchedSearch).to.equal([]);
    expect(twitterBot.streamingSearchParameters).to.equal([]);
    expect(twitterBot.streamingApiRouter).to.equal({});
    done();
  });
  
  describe('initialize function', () => {
    it('should correctly set the value of username and id', (done) => {
      twitterBot.initialize((data, response) => {
        expect(this.screen_name).to.not.equal(null);
        expect(this.user_id).to.not.equal(null);
        done();
      });
    });
  });
  
  describe('tweet function', () => {
    let tweetToReplyToId = null;
    before('set up tweets to reply to', (done) => {
      new Promise((resolve, reject) => {
        twit2.get('account/verify_credentials', (err, data, response) => {
          if(err){
            return reject(err);
          }
          console.log('Successfully got account/verify_credentials');
          twit2ScreenName = data.screen_name;
          twit2UserId = data.id;
          resolve(data, response);
        }); 
      })
        .then((data, response) => {
          return new Promise((resolve, reject) => {
            twit2.post('statuses/update', {status: 'testing'}, (err, data, response) => {
              if(err){
                return reject(err);
              }
              resolve(data, response);
            });
          });
        })
        .then((data, response) => {
          console.log('Successfully posted to statuses/update');
          tweetToReplyToId = data.id_str;
          done();
        })
        .catch((err) => {
          console.log(err);
          done();
        });
    });
    
    it('should let you tweet a string', (done) => {
      twitterBot.tweet('Hello world', (err, data, response) => {
        expect(err).to.equal(null);
        expect(data.text).to.equal('Hello world');
        done();
      });
    });
    it('should let you tweet a string at a user', (done) => {
      twitterBot.tweet('Hello world', (err, data, response) => {
        expect(err).to.equal(null);
        expect(data.text).to.equal('@' + twit2ScreenName + ' Hello world');
        done();
      }, {
        screenNameToTweetAt: twit2ScreenName
      });
    });
    it('should let you tweet a string in reply to a tweet', (done) => {
      twitterBot.tweet('Hello world', (err, data, response) => {
        expect(err).to.equal(null);
        expect(data.text).to.equal('@' + twit2ScreenName + ' Hello world');
        expect(data.in_reply_to_user_id_str).to.equal(twit2ScreenName);
        expect(data.in_reply_to_user_id).to.equal(twit2UserId);
        expect(data.in_reply_to_status_id_str).to.equal(tweetToReplyToId);
        done();
      }, {
        screenNameToTweetAt: twit2ScreenName,
        tweetIdToReplyTo: tweetToReplyToId
      });
    });
  });
});


// describe('tweet function', () => {
// 
// 
// });
