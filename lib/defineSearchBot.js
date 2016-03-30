'use strict';

//Stretch goal: allow stringToSearchFor to be regex if they are using RESTOnly?
module.exports = function(parent){
  console.log('defineSearchBot required in');
  
  //This is the method that users will use to define new search bots
  parent.__proto__.defineSearchBot = function(content, stringToSearchFor, callback, optionsObj){ //this is the function that they'll use to 
    try { //to define new bot
      if(content && stringToSearchFor){
        let newSearchBot = new this._SearchBot(content, stringToSearchFor, optionsObj);
        parent.bots.searchBots[newSearchBot.bonName] = newSearchBot;
        
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
  
  
  
  
  function _SearchBot(content, stringToSearchFor, optionsObj){ //constructor function for search bots
    if(!content || !stringToSearchFor){
      throw new Error('Invalid input parameters.');
    }
    
    this.content              = content;
    this.stringToSearchFor    = stringToSearchFor; //TODO: need to do a lot of processing here
    this.running              = false;
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
    
    // this.stringToSearchFor = 
  }
  
  
  
  
  
  
  
  //initialization function to start the search bot running
  //This checks to see whether RESTOnly is enabled or not and then calls the appropriate initialization function
  _SearchBot.prototype.initialize = function(callback){ 
    console.log('  _SearchBot.prototype.initialize called');
    if(this.RESTOnly){
      this.initializeREST(callback);
    } else {
      this.initializeStreaming(callback);
    }
  };
  
  //TODO: This is the function to start the bot running if RESTOnly is disabled
  //This should add the streaming parameters into the list of things to track
  _SearchBot.prototype.initializeStreaming = function(callback){
    console.log('_SearchBot.prototype.initializeStreaming called');
    
    
    
  };
  
  //TODO: This is the function to start the bot running if RESTOnly is enabled
  //This should just make rest calls 
  _SearchBot.prototype.initializeREST = function(callback){
    console.log('_SearchBot.prototype.initializeREST called');    
    // (function runBot (self) {
    //   try {
    //     
    //     
    //   } catch (err) {
    //     
    //   }
    // })(this);
  };
  
  
  
  
  
  
  
  
  //TODO: This function will end the twitterBot
  //needs to remove search terms from terms to track, then restore the stream if there are still parameters that we want to track
  _SearchBot.prototype.stop = function(callback){
    
    
    
  };
  
  
  
  
  
  
  
  
  
  return _SearchBot;
};
