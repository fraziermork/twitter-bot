'use strict';

const _  = require('lodash');





module.exports = function(TwitterBot){
  console.log('streaming-router.js required in');
  
  
  
  //This determines whether a reply bot is running or not.
  //It is used whenever streaming parameters are updated to determine whether or not to track mentions of the twitterBot's username
  //returns true or false
  //TODO: fix this so it grabs the bot not the name
  TwitterBot.prototype._checkIfAReplyBotIsRunning = function(){
    console.log('TwitterBot.prototype._checkIfAReplyBotIsRunning called');
    let replyBotNames = Object.keys(this.bots.replyBots);
    for (var i = 0; i < Object.keys(this.bots.replyBots).length; i++) {
      let currentReplyBot = this.bots.replyBots[replyBotNames[i]];
      if (currentReplyBot._running && !currentReplyBot.RESTOnly){
        return true;
      }
    }
    return false;
  };





  // // TODO: The purpose of this function is to update the parameters being tracked by the streaming API
  // //needs to go through all of the bots listed as running, grab their search parameters, assemble them into one coherent string formatted for twitter's track, and pass it in as an option
  // //should check to make sure that the total list of things being tracked is under the 60 byte limit or throw an error
  // //should return the new streaming parameters for testing purposes
  TwitterBot.prototype._updateStreamingSearchParameters = function(){
    console.log('TwitterBot.prototype._updateStreamingSearchParameters called');
    let arrayOfTextSearchParameters = this._collectAllSearchBotMatchStrings() || [];
    let replyBotRunningFlag         = this._checkIfAReplyBotIsRunning();
    if (replyBotRunningFlag){
      arrayOfTextSearchParameters.push('@' + this.screen_name);
    }
    this._streamingSearchParameters  = arrayOfTextSearchParameters;
    this._stringToTrack              = this._streamingSearchParameters.join();
  };





  //This is the function used to start the stream used to communicate with twitter
  TwitterBot.prototype._startApiStream = function(){
    console.log('TwitterBot.prototype._startApiStream called');
    let self = this;
    self._updateStreamingSearchParameters();
    self._updateStreamingApiRouter();
    // console.log('self._stringToTrack is ' + self._stringToTrack);
    self._searchStream = self.twit.stream('statuses/filter', {track: self._stringToTrack});
    self._searchStream.on('tweet', function(tweet) {
      // console.log('tweet occured ', tweet.text);
      self._handleStreamingTweetEvent(tweet);
    });
  };
  
  
  
  
  
  //This collects all the match parameters for the different search bots
  //This is used whenever streaming paramters are updated
  //returns a flat array of the match strings for all running search bots
  TwitterBot.prototype._collectAllSearchBotMatchStrings = function(){
    console.log('TwitterBot.prototype._collectAllSearchBotMatchStrings called');
    return _.flatten(_.compact(Object.keys(this.bots.searchBots).map((currentSearchBotName) => {
      let currentSearchBot = this.bots.searchBots[currentSearchBotName];
      if(currentSearchBot instanceof Object && currentSearchBot._running && !currentSearchBot.RESTOnly){
        return currentSearchBot._matchStrings;
      } else {
        return null;
      }
    })));
  };
  
  
  
  
  
  
  
  
  
  
  
  
  
  //This is used to update the streaming api router to make sure that the router has only properites associated with running search bots
  TwitterBot.prototype._updateStreamingApiRouter = function(){
    console.log('TwitterBot.prototype._updateStreamingApiRouter called');
    let self = this;
    self._streamingApiRouter = {};
    
    if(this._checkIfAReplyBotIsRunning()){
      //sets the reply bot to the screen name as a key
      let activeReplyBotName = Object.keys(self.bots.replyBots).filter((currentReplyBotName) => {
        var currentReplyBot = self.bots.replyBots[currentReplyBotName];
        return currentReplyBot instanceof Object && currentReplyBot._running && !currentReplyBot.RESTOnly;
      })[0];
      
      // console.log('activeReplyBotName is ' + activeReplyBotName);
      
      self._streamingApiRouter['@' + self.screen_name] = {
        regexRouter: new RegExp('(?=.*' +  _.escapeRegExp(self.screen_name) + ')', 'i'),
        currentBot: self.bots.replyBots[activeReplyBotName]
      };
    }

    // console.log('active reply bot is ', self.bots.replyBots[activeReplyBotName]);


    //builds out the search terms in the router
    Object.keys(this.bots.searchBots).forEach((currentSearchBotName) => {
      console.log('currentSearchBotName is ', currentSearchBotName);
      let currentSearchBot = this.bots.searchBots[currentSearchBotName];
      if(!(currentSearchBot instanceof Object) || !currentSearchBot._running || currentSearchBot.RESTOnly){ //the only strings that get attached to the router are those from bots that are running
        return;
      }
      
      console.log('Going to assign match string of ' + currentSearchBot._regexRouterString + ' to ' + currentSearchBot.botName);
      self._streamingApiRouter[currentSearchBot._regexRouterString] = {
        regexRouter: new RegExp(currentSearchBot._regexRouterString, 'i'),
        currentBot: currentSearchBot
      };
    });
    
    self._streamingApiRouterKeys = Object.keys(self._streamingApiRouter);
    console.log('self._streamingApiRouterKeys is ', self._streamingApiRouterKeys);
  };
  
  
  
  
  
  // //TODO: This is the handler that makes the appropriate functions run when a tweet event occurs
  // //This should parse the tweet to see which of the handlers it relates to, then calls the associated handler
  // //gets added as the function to run on 'tweet' events to the TwitterBot._searchStream coming in
  // //when a tweet comes in, it first checks to see if it was triggered by a running reply bot, and posts the reply of the first one
  // //if no reply bots were triggered, it checks to see if it was triggered by a running search bot, and posts the reply of the first one that matched
  TwitterBot.prototype._handleStreamingTweetEvent = function(tweet) {
    
    console.log('TwitterBot.prototype._handleStreamingTweetEvent called');
    console.log('_____________________________________________________________________');
    console.log(tweet.user.name);
    console.log(tweet.text);
    console.log('_____________________________________________________________________');

    if (tweet.user.screen_name === this.screen_name){
      console.log('Tweet event was caused by this bot');
      return;
    }
    if(this.filterByLang && !(this.acceptableLang === tweet.lang)){
      console.log('Tweet did not match language requirement.');
      return;
    }
    
    for (var i = 0; i < this._streamingApiRouterKeys.length; i++) {
      if (tweet.text.match(this._streamingApiRouter[this._streamingApiRouterKeys[i]]['regexRouter'])){
        console.log('It matched with ' + this._streamingApiRouterKeys[i]);
        return this._streamingApiRouter[this._streamingSearchParameters[i]]['currentBot']._handleTweet(tweet);
      }
    }
  };
};
