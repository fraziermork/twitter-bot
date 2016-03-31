'use strict';
//Chai stuff
let chai        = require('chai');
let expect      = chai.expect;

//rewire the TwitterBot constructor to use a different set of API keys for the tests
// let rewire      = require('rewire');
let Twit        = require('twit');
let testKeys    = require(__dirname + '/../config/test-config1.js'); //TODO: will need to be changed later
let TwitterBot  = require(__dirname + '/../lib/twitter-bot.js');
let twit        = new Twit(testKeys);
// TwitterBot.__set__('twit', twit);

//declare the other user's twit
let secondTestKeys = require(__dirname + '/../config/test-config2.js');
let twit2 = new Twit(secondTestKeys);
let twit2ScreenName;
let twit2UserId;
let twit2StatusesToDestroy = [];

//declare twitterBot, the bot that we will be using for all of our tests
let twitterBot;
let twitterBotstatusesToDestroy = [];

describe('twitter-bot.js', () => {
  
  describe('constructor function', () => {
    it('should let you build a new instance of a TwitterBot', (done) => {
      twitterBot = new TwitterBot();
      expect(twitterBot.twit).to.be.instanceof(Twit); //check to make sure the constuctor built a twit instance correctly
      twitterBot.twit = twit;                         //then set the twit used from here on to be the one that uses the test keys
      expect(twitterBot.SafeMode).to.equal(true);
      expect(twitterBot.RESTOnly).to.equal(false);
      expect(twitterBot.screen_name).to.equal(null);
      expect(twitterBot.user_id).to.equal(null);
      expect(twitterBot._tweetIdsRepliedTo).to.be.instanceof(Array);
      expect(twitterBot._tweetIdsThatMatchedSearch).to.be.instanceof(Array);
      expect(twitterBot._streamingSearchParameters).to.be.instanceof(Array);
      expect(twitterBot._streamingApiRouter).to.be.instanceof(Object);
      done();
    });
  });
  
  describe('initialize function', () => {
    it('should correctly set the value of username and id', (done) => {
      twitterBot.initialize((data, response) => {
        expect(this.screen_name).to.not.equal(null);
        expect(this.user_id).to.not.equal(null);
        console.log('Data from initialize:');
        console.log(data);
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
          twit2UserId = data.id_str;
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
          twit2StatusesToDestroy.push(data.id_str);
          done();
        })
        .catch((err) => {
          console.log(err);
          done();
        });
    });
    
    it('should let you tweet a string', (done) => {
      twitterBot.tweet('Hello world', (err, data, response) => {
        if(err){
          console.log('Error is');
          console.log(err);
        }
        expect(err).to.equal(null);
        twitterBotstatusesToDestroy.push(data.id_str);
        expect(data.text).to.equal('Hello world');
        done();
      });
    });
    
    it('should let you tweet a string at a user', (done) => {
      twitterBot.tweet('Hello world', (err, data, response) => {
        if(err){
          console.log('Error is');
          console.log(err);
        }
        expect(err).to.equal(null);
        twitterBotstatusesToDestroy.push(data.id_str);
        expect(data.text).to.equal('@' + twit2ScreenName + ' Hello world');
        done();
      }, {
        screenNameToTweetAt: twit2ScreenName
      });
    });
    
    it('should let you tweet a string in reply to a tweet', (done) => {
      twitterBot.tweet('Hello world', (err, data, response) => {
        console.log('Inside of the tweet in reply test');
        if(err){
          console.log('Error is');
          console.log(err);
        }
        expect(err).to.equal(null);
        twitterBotstatusesToDestroy.push(data.id_str);
        expect(data.text).to.equal('@' + twit2ScreenName + ' Hello world');
        expect(data.in_reply_to_user_id_str).to.equal(twit2UserId);
        expect(data.in_reply_to_status_id_str).to.equal(tweetToReplyToId);
        console.log('Just before the tweet in reply done');
        done();
      }, {
        screenNameToTweetAt: twit2ScreenName,
        tweetIdToReplyTo: tweetToReplyToId
      });
    });
  });
  
  after('destroy tweets from tests', (done) => {
    Promise.all(twitterBotstatusesToDestroy.map((currentId) => {
      return new Promise((resolve, reject) => {
        twitterBot.twit.post('statuses/destroy/:id', {id: currentId}, (err, data, response) => {
          if (err){
            return reject(err);
          }
          return resolve(data.id);
        });
      });
    }))
      .then((promiseAllDeleteData) => {
        console.log('Deleted tweets ' + promiseAllDeleteData);
        return Promise.all(twit2StatusesToDestroy.map((currentId) => {
          return new Promise((resolve, reject) => {
            twit2.post('statuses/destroy/:id', {id: currentId}, (err, data, response) => {
              if (err){
                return reject(err);
              }
              return resolve(data.id);
            });
          });
        }));
      })
      .then((promiseAllDeleteData) => {
        console.log('Deleted tweets ' + promiseAllDeleteData);
        done();
      })
      .catch((err) => {
        console.log('Error deleting all tweets', err);
        done();
      });  
  });
});


// describe('tweet function', () => {
// 
// 
// });
