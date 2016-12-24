// npm modules 
const debug        = require('debug')('tb:test-ruleManager');
// const co           = require('co');
const chai         = require('chai');
const expect       = chai.expect;

// internal modules 
const utils        = require('../lib/utils'); 
const defaultRules = require('../rules');
// const metaRules    = require('../rules/meta-rules');
const Unitwit      = require('./lib/unitwit');


// Set up tweet generation utilities 
const currentUser = Unitwit.mock.apiResponse.verifyCredentials({
  name:        'Current User', 
  screen_name: 'currentUser', 
});
const otherUser   = Unitwit.mock.apiResponse.verifyCredentials({
  name:        'Other User', 
  screen_name: 'otherUser', 
});
Unitwit.mock.user.setUser(currentUser);
Unitwit.mock.user.setUser(otherUser, 'other');

// Set up utils module 
utils._accountInfo.res = currentUser;
// utils._setTwit(new Unitwit({
//   consumer_key:        'a',
//   consumer_secret:     'b',
//   access_token:        'c',
//   access_token_secret: 'd',
// }));

describe('rules', function() {
  describe('default rules', function() {
    
    describe('isReply', function() {
      before('attach rule', function() {
        this.isReply = defaultRules.filter((rule) => {
          return rule.ruleName === 'isReply';
        })[0];
      });
      it('Should correctly identify replies to the authenticated user', function(done) {
        const tweetRepliedTo = Unitwit.mock.tweet.generic('hello world', Unitwit.mock.user.current);
        const replyTweet     = Unitwit.mock.tweet.reply('foo bar', tweetRepliedTo);
        
        this.isReply.check(replyTweet, {}, {})
          .then((result) => {
            expect(result).to.equal(true);
            done();
          })
          .catch(done);
      });
      it('Should not incorrectly labels tweets as replies if they are not', function(done) {
        const tweet = Unitwit.mock.tweet.generic('hello world');
        
        this.isReply.check(tweet, {}, {})
          .then((result) => {
            expect(result).to.equal(false);
            done();
          })
          .catch(done);
      });
    });
    
    describe('isMention', function() {
      before('attach rule', function() {
        this.isMention = defaultRules.filter((rule) => {
          return rule.ruleName === 'isMention';
        })[0];
        debug('isMention: ', this.isMention);
      });
      it('Should correctly identify mentions of the authenticated user', function(done) {
        const mentionTweet = Unitwit.mock.tweet.mention('hello current user');
        this.isMention.check(mentionTweet, {}, {})
          .then((result)=> {
            expect(result).to.equal(true);
            done();
          })
          .catch(done);
      });
      it('Should correctly identify mentions of the user listed in the options', function(done) {
        const mentionTweet = Unitwit.mock.tweet.mention('hello current user', Unitwit.mock.user.other, Unitwit.mock.user.current);
        
        this.isMention.check(mentionTweet, {}, { mentionedUser: Unitwit.mock.user.other })
          .then((result)=> {
            expect(result).to.equal(true);
            done();
          })
          .catch(done);
      });
      it('Should not incorrectly labels tweets as mentions if they are not', function(done) {
        const tweet = Unitwit.mock.tweet.generic('hello world');
        
        this.isMention.check(tweet, {}, {})
          .then((result)=> {
            expect(result).to.equal(false);
            done();
          })
          .catch(done);
      });
    });
    
    describe('isRetweet', function() {
      before('attach rule', function() {
        this.isRetweet = defaultRules.filter((rule) => {
          return rule.ruleName === 'isRetweet';
        })[0];
      });
      it('Should correctly identify retweets as such', function(done) {
        const statusToRetweet = Unitwit.mock.tweet.generic('hello world', Unitwit.mock.user.current);
        const retweet         = Unitwit.mock.tweet.retweet(statusToRetweet);
        
        this.isRetweet.check(retweet, {}, {})
          .then((result) => {
            expect(result).to.equal(true);
            done();
          })
          .catch(done);
      });
      it('It should not incorrectly label tweets as retweets if they are not', function(done) {
        const tweet = Unitwit.mock.tweet.generic('hello world');
        
        this.isRetweet.check(tweet, {}, {})
          .then((result) => {
            expect(result).to.equal(false);
            done();
          })
          .catch(done);
      });
    });
    
  });

  // describe('meta rules', function() {
  //   it('');
  // });

});
