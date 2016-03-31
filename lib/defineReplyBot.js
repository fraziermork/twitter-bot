'use strict';
const _ = require('lodash');

module.exports = function(parent){
  console.log('defineReplyBot required in');
  
  parent.__proto__.defineReplyBot = function(content, callback, optionsObj){
    console.log('parent.__proto__.defineSearchBot called');
    try { //to define new bot
      if(content){
        let newReplyBot = new this._ReplyBot(content, optionsObj);
        parent.bots.replyBots[newReplyBot.botName] = newReplyBot;
        console.log(parent.bots.replyBots.backwards_bot.botName + ' attached to parent.');
        if(callback){
          callback(null, newReplyBot.botName);
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
  
  function _ReplyBot(content, optionsObj){
    console.log('New _ReplyBot about to be constructed.');
    if(!content){
      throw new Error('Invalid input parameters.');
    }
    this.content                = content;
    this._running               = false;
    this.dontStopOnError        = false;
    this.treatRepliesAsDiscinct = true;
    this.botName                = 'replyBot' + parent.bots.replyBots.counter++;
    this.RESTOnly               = parent.RESTOnly;
    this.interval               = 3600000; //ignored unless RESTOnly enabled
    
    if (optionsObj){
      if(optionsObj.botName){
        this.botName = optionsObj.botName;
      }
      if(optionsObj.callback){
        this.callback = optionsObj.callback;
      }
      if(optionsObj.tweetOptions){
        this.tweetOptions = optionsObj.tweetOptions;
      }
      if(optionsObj.RESTOnly){
        this.RESTOnly = optionsObj.RESTOnly;
      }
      if(optionsObj.interval){
        this.interval = optionsObj.interval;
      }
    }
  }
  
  _ReplyBot.prototype.initialize = function(callback){
    console.log('_ReplyBot.prototype.initialize called on ' + this.botName);
    this._running = true;
    this._running = true;
    if(this.RESTOnly){
      this._initializeREST(callback);
    } else {
      this._initializeStreaming(callback);
    }
  };
  
  _ReplyBot.prototype._initializeStreaming = function(callback){
    console.log('_ReplyBot.prototype.initializeStreaming called on ' + this.botName);
    parent._streamingSearchParameters.push('@' + parent.screen_name);
    parent._startApiStream();
    if (callback instanceof Function){
      callback(null, this.botName); //TODO: figure out a way to pass this a real parameter to make it testable, as is it can never pass an error in
    } else if (callback){
      throw new Error('Error: callback is not a function.');
    }
  };
  
  
  //TODO: this takes in a tweet event that was tracked and determines if it matched this searchBot's stringToSearchFor. 
  //If it does, it will return the appropriate content string, otherwise it will return false. 
  _ReplyBot.prototype._returnTweetString = function(tweet){
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
  
  _ReplyBot.prototype._handleTweet = function(tweet){
    console.log('_ReplyBot.prototype._handleTweet called on '  + this.botName);
    console.log(this.botName + 'is running? ' + this._running);
    //break out if the bot isn't supposed to be running
    if(!this._running){
      console.log(this.botName + ' not running, going to exit out');
      return;
    }
    
    
    let tweetOptions = {}; //TODO: assign parent options too 
    _.assign(tweetOptions, this.tweetOptions);
    tweetOptions.screenNameToTweetAt  = tweet.user.screen_name;
    tweetOptions.tweetIdToReplyTo     = tweet.id_str;

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
  
  _ReplyBot.prototype._initializeREST = function(){
    console.log('REST doesnt work yet');
  };
  
  
  
  return _ReplyBot;
};
