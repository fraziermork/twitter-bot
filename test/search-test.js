'use strict';
//chai test stuff
let chai        = require('chai');
let expect      = chai.expect;
let TwitterBot  = require(__dirname + '/../lib/twitter-bot.js');
let Twit        = require('twit');
let testKeys    = require(__dirname + '/../config/test-config1.js');
let twit        = new Twit(testKeys);
let twitterBot  = new TwitterBot();
twitterBot.twit = twit;
let testDefinedCallback = function(err, data, response) {
  if (err){
    console.log('Error posting content', err);
    return 'error';
  } else {
    console.log('callback is ' + data);
    return data;
  }
};


describe('defineSearchBot.js', ()=>{

  describe('constructor function', ()=>{
    it('should let you define a new search bot', function(done) {
      let searchContent = (new Date()).toISOString;
      let searchString = 'search';
      let searchBotOptions = {
        botName: 'test_bot',
        callback: testDefinedCallback
      };

      twitterBot.defineSearchBot(searchContent, searchString, function(){
        expect(twitterBot.bots.searchBots).has.ownProperty('test_bot');
        expect(twitterBot.bots.searchBots.test_bot).to.be.an('object');
        expect(twitterBot.bots.searchBots.test_bot.botName).to.eql('test_bot');
        expect(twitterBot.bots.searchBots.test_bot.stringToSearchFor).to.eql('search');
        expect(twitterBot.bots.searchBots.test_bot.content).to.not.eql(null);
        expect(twitterBot.bots.searchBots.test_bot.callback(null, 'working')).to.eql('working');
        done();
        
      }, searchBotOptions);

    });

  });

  describe('initialize method', () => {
    var searchContent2, searchString2, sbDefinedCallback, searchBotOptions2;
    before('setting up a new searchBot', function(done) {
      searchContent2 = 'this is another string';
      searchString2 = 'another';
      searchBotOptions2 = {
        botName: 'test_bot2',
        callback: testDefinedCallback
      };
      done();
    });

    it('should be called in the respective callback', function(done) {
      sbDefinedCallback = function(error, botName) {
        twitterBot.bots.searchBots.test_bot.initialize(function(err, botName) {
          // var curBotName = twitterBot.bots.searchBots.test_bot2.botName;
          if (err) {
            console.error(err);
          } else {
            console.log(botName + ' started');
            expect(twitterBot.bots.searchBots).has.ownProperty('test_bot2');
            expect(twitterBot.bots.searchBots.test_bot2).to.be.an('object');
            expect(twitterBot.bots.searchBots.test_bot2.botName).to.eql('test_bot2');
            expect(twitterBot.bots.searchBots.test_bot2.stringToSearchFor).to.eql('another');
            expect(twitterBot.bots.searchBots.test_bot2.content).to.eql('this is another string');
            expect(twitterBot.bots.searchBots.test_bot2.callback(null, 'still working')).to.eql('still working');
            done();
          }
          // expect(twitterBot.bots.searchBots[curBotName]._running).to.eql(true);
        });
      };
      twitterBot.defineSearchBot(searchContent2, searchString2, sbDefinedCallback, searchBotOptions2);
    });

  });
});
