'use strict';
const _ = require('lodash');

//Stretch goal: allow stringToSearchFor to be regex if they are using RESTOnly?
module.exports = function(parent){
  console.log('defineSearchBot required in');
  
  //This is the method that users will use to define new search bots
  parent.__proto__.defineSearchBot = function(content, stringToSearchFor, callback, optionsObj){ //this is the function that they'll use to 
    console.log('parent.__proto__.defineSearchBot called');
    try { //to define new bot
      if(content && stringToSearchFor){
        let newSearchBot = new this._SearchBot(content, stringToSearchFor, optionsObj);
        parent.bots.searchBots[newSearchBot.botName] = newSearchBot;
        console.log(parent.bots.searchBots.backwards_bot.botName + ' attached to parent.');
        if(callback){
          callback(null, newSearchBot.botName);
        }  
      } else {
        throw new Error('Incorrect parameters supplied.');
      }
    } catch (err) { //in case of failure to define new bot
      console.log('Error occured generating new SearchBot', err);
      if(callback){
        try {
          callback(err);
        } catch (e){
          console.log('Error running callback', e);
        }
      }
    }
  };
  
  
  
  //constructor function for search bots
  function _SearchBot(content, stringToSearchFor, optionsObj){ 
    console.log('New _SearchBot about to be constructed.');
    if(!content || !stringToSearchFor || typeof stringToSearchFor !== 'string'){
      throw new Error('Invalid input parameters.');
    }
    
    this.content              = content;
    this.stringToSearchFor    = stringToSearchFor; 
    this._matchStrings        = stringToSearchFor.split(', ');
    this._running             = false;
    this.dontStopOnError      = false;
    this.postInReply          = false; //defaults to posting on your own page instead of in response to the tweets that matched
    this.botName              = 'searchBot' + parent.bots.searchBots.counter++;
    this.RESTOnly             = parent.RESTOnly;
    this.interval             = 3600000; //ignored unless RESTOnly enabled
    
    if (optionsObj){
      if (optionsObj.dontStopOnError){
        this.dontStopOnError = optionsObj.dontStopOnError;
      }
      if (optionsObj.botName){
        this.botName = optionsObj.botName;
      }
      if (optionsObj.tweetOptions){
        this.tweetOptions === optionsObj.tweetOptions; //TODO: refactor so that the content function can provide the tweet options? look into merging object properties so that they can pass in general options here and more specific options there
      }
      if (optionsObj.callback && optionsObj.callback instanceof Function){
        this.callback = optionsObj.callback;
      }
      if (optionsObj.postInReply){
        this.postInReply = optionsObj.postInReply;
      }
      if (optionsObj.RESTOnly){
        this.RESTOnly = optionsObj.RESTOnly;
      }
      if (optionsObj.interval){
        this.interval = (optionsObj.interval >= 60000) ? optionsObj.interval : 60000;
      }
    }
    console.log('Done building a new _SearchBot ', this.botName);
    console.log(this.stringToSearchFor, this._matchStrings);
  }
  

  //initialization function to start the search bot running
  //This checks to see whether RESTOnly is enabled or not and then calls the appropriate initialization function
  _SearchBot.prototype.initialize = function(callback){ 
    console.log('  _SearchBot.prototype.initialize called on ' + this.botName);
    this._running = true;
    if(this.RESTOnly){
      this._initializeREST(callback);
    } else {
      this._initializeStreaming(callback);
    }
  };
  
  //TODO: This is the function to start the bot running if RESTOnly is disabled
  //This should add the streaming parameters into the list of things to track
  _SearchBot.prototype._initializeStreaming = function(callback){
    console.log('_SearchBot.prototype.initializeStreaming called on ' + this.botName);
    parent._streamingSearchParameters.concat(this._matchStrings);
    parent._startApiStream();
    if (callback instanceof Function){
      callback(null, this.botName); //TODO: figure out a way to pass this a real parameter to make it testable, as is it can never pass an error in
    } else if (callback){
      throw new Error('Error: callback is not a function.');
    }
  };
  
  //TODO: this takes in a tweet event that was tracked and determines if it matched this searchBot's stringToSearchFor. 
  //If it does, it will return the appropriate content string, otherwise it will return false. 
  _SearchBot.prototype._returnTweetString = function(tweet){
    console.log('_SearchBot.prototype._returnTweetString called on '  + this.botName);
    return new Promise((resolve, reject) => {
      try {
        let stringToTweet = this.content(tweet, resolve);
        if(stringToTweet !== undefined){
          resolve(stringToTweet);
        }
      } catch (err) {
        reject(err);
      }
    });
  };
  
  //This is the method that will be used to handle tweets for both the REST and streaming APIs
  _SearchBot.prototype._handleTweet = function(tweet){
    console.log('_SearchBot.prototype._handleTweet called on '  + this.botName);
    console.log(this.botName + 'is running? ' + this._running);
    //break out if the bot isn't supposed to be running
    if(!this._running){
      console.log(this.botName + ' not running, going to exit out');
      return;
    }
    
    
    let tweetOptions = {}; //TODO: assign parent options too 
    _.assign(tweetOptions, this.tweetOptions);
    if(this.postInReply){
      tweetOptions.screenNameToTweetAt  = tweet.user.screen_name;
      tweetOptions.tweetIdToReplyTo     = tweet.id_str;
    }
    console.log('tweetOptions are ', tweetOptions);
    try {
      if(this.content instanceof Function){
        console.log('content was a function');
        let stringGenerationPromise = this._returnTweetString(tweet); //TODO: rename this to make more sense
        // console.log('line after asking for the promise', );
        stringGenerationPromise
        .then((stringToTweet) => {
          console.log('stringToTweet is ', stringToTweet);
          parent.tweet(stringToTweet, this.callback, tweetOptions);
        })
        .catch((err) => {
          throw new Error(err);
        });
      } else if (typeof this.content === 'string' || typeof this.content === 'number'){
        console.log('Content was a string or a number');
        parent.tweet(this.content, this.callback, tweetOptions);
      } else {
        console.log('Content was of an Unsupported type');
        throw new Error('Unsupported content type.');
      }
    } catch (err) {
      console.log('Error occured: ' + err);
      throw new Error('Error occured:' + err);
    }
  };
  
  //TODO: This is the function to start the bot running if RESTOnly is enabled
  //This should just make rest calls on a timer, exactly like the timer bot but with a different endpoint
  //it will post what is dictated by content for each item in the returned search if it hasn't been replied to before. 
  //if content is a function, it call the content function with the tweet as an argument
  //depending on the value of postInReply, it will either reply back to the original tweet or just tweet to it's page
  // _SearchBot.prototype._initializeREST = function(callback){
  //   console.log('_SearchBot.prototype.initializeREST called');    
    // (function runBot (self) {
    //   try {
    //     
    //     
    //   } catch (err) {
    //     
    // 
    //   }
    // })(this);
  // };
  
  
  //TODO: this takes the results of a REST GET search call and posts content for each one if it hasn't been posted for already
  // _SearchBot.prototype._postContentForRESTResults = function(apiResults){
  //   console.log('_SearchBot.prototype._postContentForRESTResults called');
  //   
  //   
  //   
  // };
  
  
  
  //TODO: This function will end the twitterBot
  //needs to stop the stream, remove search terms from terms to track, then restore the stream if there are still parameters that to be tracked
  // _SearchBot.prototype.stop = function(callback){
  //   console.log('_SearchBot.prototype.stop called');
  //   this._running = false;
  //   if(!this.RESTOnly) { //if this is set to RESTOnly, we shouldn't need to restart the api stream
  //     parent._startApiStream();
  //   }
  // };
  
  
  
  
  
  
  
  
  
  return _SearchBot;
};
