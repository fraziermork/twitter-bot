
'use strict';
const Twit        = require('twit');
const apiKeys     = require(__dirname + '/../config/config.js');

//this is the constructor function for a new TwitterBot
//optionsObj has properties RESTOnly(Boolean, default false), SafeMode(Boolean, default true)
const TwitterBot = module.exports =  function(optionsObj){
  //General properties
  this.screen_name                = null;   //screenname of the bot associated with credentials provided
  this.user_id                    = null;   //twitter id of the bot associated with credentials provided
  this.twit                       = new Twit(apiKeys);
  this.testMode                   = process.env.TWITTER_BOT_TEST_MODE || false; //set this if you want to see everything that you would be tweeting, but not actually post the tweets //TODO: write about this in documentation
  this.SafeMode                   = true;   //TODO: implement this to prevent accidentally tweeting of unacceptable material
  this.RESTOnly                   = false;  //TODO: implement RESTOnly versions of bots
  this.filterByLang               = true;
  this.acceptableLang             = 'en';
  
  //properties pulled in from optionsObj passed to the constructor
  if(optionsObj){
    try {
      this.SafeMode               = optionsObj.SafeMode !== false;  //will filter all tweets for NSFW content before posting
      this.RESTOnly               = optionsObj.RESTOnly || false;   //tells all functions to default to using REST apis only, no streaming APIs will be used
      this.filterByLang           = optionsObj.filterByLang;
      this.acceptableLang         = optionsObj.acceptableLang;
    } catch (err) {
      console.log('Error processing the options Object', err);
    }
  }

  //bots attached to this TwitterBot, counter in each is a number that shows the total number of bots of each type attached to the bot
  this.bots                       = {};
  this.bots.botLists              = [this.bots.timerBots, this.bots.replyBots, this.bots.searchBots];
  this.bots.timerBots             = {counter: 0};
  this.bots.replyBots             = {counter: 0};
  this.bots.searchBots            = {counter: 0};

  //bot constructors
  this._TimerBot                  = require(__dirname + '/defineTimerBot.js')(this);
  this._ReplyBot                  = require(__dirname + '/defineReplyBot.js')(this);
  this._SearchBot                 = require(__dirname + '/defineSearchBot.js')(this);

  //properties related to using REST apis
  this._tweetIdsRepliedTo         = []; //list of tweet ids we have replied to so that we don't double reply when using the REST apis to reply to tweets
  this._tweetIdsThatMatchedSearch = []; //list of tweet ids that matched the search parameters so that we don't double reply when using the REST apis to search tweets

  //properties replated to using streaming apis
  this._streamingApiRouter        = {}; //this is the router used to determine which function should be attached to which match string, key pairs are match strings:searchBot
  this._streamingSearchParameters = []; //full array of all search terms, max size 60 bytes 
  this._stringToTrack             = null;
  this._searchStream              = null;

};

//attach methods to the TwitterBot prototype
require(__dirname + '/tweeting.js')(TwitterBot);          //attach methods to handle tweeting
require(__dirname + '/bot-handlers.js')(TwitterBot);      //attach methods to handle initialize, stop, and calling other methods on bots
require(__dirname + '/streaming-router.js')(TwitterBot);  //attach methods to handle routing for streaming apis
