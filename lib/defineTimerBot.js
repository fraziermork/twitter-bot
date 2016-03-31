'use strict';


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
  
  
  
  function _TimerBot(content, optionsObj){
    this.dontStopOnError    = false;
    this.interval           = 3600000;
    this._running            = false;
    this.content            = content;
    this.botName            = 'timerBot' + parent.bots.timerBots.counter++; //this should be an automatically incrementing number showing the total number of bots of this type attached to the main twitterBot instance
    
    if (optionsObj){ //TODO: refactor to default option or object.keys thing?
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
        this.tweetOptions = optionsObj.tweetOptions; //TODO: refactor so that the content function can provide the tweet options? look into merging object properties so that they can pass in general options here and more specific options there
      }
      if (optionsObj.callback && optionsObj.callback instanceof Function){
        this.callback = optionsObj.callback;
      }
    }
    console.log('New TimerBot made: ' + this.botName);
  }
  
  
  _TimerBot.prototype.initialize = function(callback){
    console.log('_TimerBot.prototype.initialize called');
    console.log(this.botName + ' initialized');
    this._running = true;
    console.log('above runbot, this is', this);
    (function runBot (self) {
      console.log('Inside runBot, self is ', self);
      
      if(!self._running){ //don't do anything if the bot isn't supposed to be running
        return;
      }
      
      try {
        //This chunk builds the string that we are going to try to tweet
        let stringToTweet; 
        if (typeof self.content === 'function'){
          new Promise((resolve, reject) => {
            try {
              stringToTweet = self.content(resolve); //TODO: content functions take a done argument, and when they are done they call done with a string, like done('tweet this');
              if(stringToTweet !== undefined){
                resolve(stringToTweet);
              }
            } catch (err) {
              reject(err);
            }
          })
          .then((generatedStringToTweet) => {
            stringToTweet = generatedStringToTweet;
          })
          .catch((err) => {
            throw new Error('Content function threw an error:', err);
          });
        } else if (typeof self.content === 'string' || typeof self.content === 'number' ){
          stringToTweet = '' + self.content;  //make it a string, numbers don't have a .toString method, is there better way?
        } else {
          throw new Error('Unsupported content type, only strings, numbers, and functions are supported');
        }
        if (typeof stringToTweet !== 'string'){
          throw new Error('Not tweeting a String!');
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
          }, self.tweetOptions);
        }).then((data, response) => {
          if(self.callback instanceof Function){
            self.callback(null, data, response);
            if(self._running === true){ //allows them to turn bots off
              setTimeout(runBot, self.interval, self);
            }
          } else if(self.callback){
            throw new Error('Error: Callback is not a function');
          }
        })
        .catch((err) => {
          if (self.callback instanceof Function) {
            callback(err);
          } else {
            throw new Error(err);
          }
        });

      } catch (err){ //this is the catch statement to deal with all errors that occur during the tweet generation and post attempt
        console.log('Error occured', err);
        if (self._running === true && self.dontStopOnError === true) {
          console.log('Setting timeout again to ' + self.interval);
          setTimeout(runBot, self.interval, self);
        } else {
          self._running === false;
        }
      }
    })(this);
    
    if (callback && callback instanceof Function){
      return callback(this._running); //returns true if the bot is running correctly, returns false if the bot broke, unless dontStopOnError is enabled
    } else if (callback){
      throw new Error('Callback is not a function');
    }
    
  };
  
  _TimerBot.prototype.stop = function(callback){
    this._running = false;
    if (callback && callback instanceof Function){
      callback(this._running);
    } else if (callback){
      throw new Error('Callback is not a function');
    }
    
  };
  
  return _TimerBot;
};
