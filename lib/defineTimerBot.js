'use strict';


//need to return the constructor function for new TimerBots

module.exports = function(parent){
  console.log('defineTimerBot required in');
  
  //this is the method that they will call to attach a timer bot to their twitterbot, pretty much everything else is going to be internal
  //callback here is the callback to run once the defineTimerBot runs, callbacks for the timerBot to run once it posts should be included inside of the optionsObj, only arguments it takes are error and botName, in that order
  parent.__proto__.defineTimerBot = function(content, callback, optionsObj){
    console.log('TwitterBot.prototype.defineTimerBot called');
    
    try {
      let newTimerBot = new this._TimerBot(content, optionsObj);
      parent.bots.timerBots[newTimerBot.botName] = newTimerBot;
      
      if(callback){
        callback(null, newTimerBot.botName);
      }
      
    } catch (err){
      console.log('Error occured generating new TimerBot', err);
      if(callback){
        try {
          callback(err);
        } catch (e){
          console.log('Error running callback', e);
        }
      }
    }
  };
  
  
  
  function TimerBot(content, optionsObj){
    this.dontStopOnError = false;
    this.interval = 3600000;
    this.running = false;
    this.content = content;
    this.botName = 'timerBot' + parent.bots.timerBots.counter++; //this should be an automatically incrementing number showing the total number of bots of this type attached to the main twitterBot instance
    
    if (optionsObj){ //TODO: refactor to object.keys thing?
      if (optionsObj.dontStopOnError) {
        this.dontStopOnError = optionsObj.dontStopOnError;
      }
      if (optionsObj.interval){
        this.interval = (optionsObj.interval >= 60000) ? optionsObj.interval : 60000;
      }
      if (optionsObj.botName){
        this.botName = optionsObj.botName;
      }
      if (optionsObj.tweetOptions){
        this.tweetOptions === optionsObj.tweetOptions; //TODO: refactor so that the content function can provide the tweet options? look into merging object properties so that they can pass in general options here and more specific options there
      }
      if (optionsObj.callback &&optionsObj.callback instanceof Function){
        this.callback = optionsObj.callback;
      }
    }
    console.log('New TimerBot made: ' + this.botName);
  }
  
  
  TimerBot.prototype.initialize = function(callback){
    console.log('TimerBot.prototype.initialize called');
    console.log(this.botName + 'initialized');
    this.running === true;
    (function runBot () {
      try {
        //This chunk builds the string that we are going to try to tweet
        let stringToTweet; 
        if (typeof content === 'function'){
          stringToTweet = this.content(); //TODO: refactor this so that it can take async functions, promises?
        } else if (typeof content === 'string' || typeof content === 'number' ){
          stringToTweet = '' + this.content;  //make it a string, numbers don't have a .toString method, is there better way?
        } else {
          throw new Error('Unsupported content type, only strings, numbers, and functions are supported');
        }
        
        //This part is where we actually try to post the tweet
        new Promise((resolve, reject) => {
          console.log('Going to tweet');
          parent.tweet(stringToTweet,function(err, data, response){
            if (err){
              console.log('Failed to tweet');
              return reject(err);
            }
            console.log('Successfully tweeted');
            return resolve(data, response);
          }, this.tw);
        }).then((data, response) => {
          if(this.callback instanceof Function){
            this.callback(null, data, response);
            if(this.running === true){ //allows them to turn bots off
              setTimeout(runBot, this.interval);
            }
          } else if(this.callback){
            throw new Error('Error: Callback is not a function');
          }
        })
        .catch((err) => {
          throw new Error(err);
        });

      } catch (err){ //this is the catch statement to deal with all errors that occur during the tweet generation and post attempt
        console.log('Error occured', err);
        if (this.running === true && this.dontStopOnError === true) {
          console.log('Setting timeout again to ' + this.interval);
          setTimeout(runBot, this.interval);
        } else {
          this.running === false;
        }
      }
    });
    
    if (callback && callback instanceof Function){
      callback(this.running); //returns true if the bot is running correctly, returns false if the bot broke, unless dontStopOnError is enabled
    } else if (callback){
      throw new Error('Provided callback is not a function');
    }
    
  };
  
  return TimerBot;
};
