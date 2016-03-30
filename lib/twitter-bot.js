'use strict';
const Twit    = require('twit');
const apiKeys    = require(__dirname + '/../config/config.js');

//this is the constructor function for a new TwitterBot
//optionsObj has properties RESTOnly(Boolean, default false), SafeMode(Boolean, default true)
const TwitterBot = module.exports =  function(optionsObj){
  //General properties
  this.screen_name                = null; //screenname of the bot associated with credentials provided
  this.user_id                    = null; //twitter id of the bot associated with credentials provided
  this.twit                       = new Twit(apiKeys); //TODO: switch how we do this to inside constructor?
  this.classList                  = []; //list that says what kind of bots are attached to this TwitterBot, like ['timerBot', 'searchBot']
  this.SafeMode                   = true; //TODO: implement this
  this.RESTOnly                   = false; //TODO: implement RESTOnly versions of bots
  
  //bots attached to this TwitterBot, counter in each is a number that shows the total number of bots of each type attached to the bot
  this.bots                       = {};
  this.bots.timerBots             = {counter: 0};
  this.bots.replyBots             = {counter: 0};
  this.bots.searchBots            = {counter: 0};
  
  //bot constructors
  this._TimerBot                   = require(__dirname + '/defineTimerBot.js')(this);
  // this._ReplyBot                   = require(__dirname + '/defineReplyBot.js')(this);
  // this._SearchBot                  = require(__dirname + '/defineSearchBot.js')(this);

  //properties related to using REST apis
  this.tweetIdsRepliedTo          = []; //list of tweet ids we have replied to so that we don't double reply when using the REST apis to reply to tweets
  this.tweetIdsThatMatchedSearch  = []; //list of tweet ids that matched the search parameters so that we don't double reply when using the REST apis to search tweets

  //properties replated to using streaming apis
  this.streamingSearchParameters  = []; //full list of all search terms, max length 60 bytes so be careful!
  this.streamingApiRouter         = {}; //this is the router used to determine which function should be attached to which match result


  //properties pulled in from optionsObj
  if(optionsObj){
    try {
      this.SafeMode                   = optionsObj.SafeMode !== false; //will filter all tweets for NSFW content before posting
      this.RESTOnly                   = optionsObj.RESTOnly || false; //tells all functions to default to using REST apis only, no streaming APIs will be used
    } catch (err) {
      console.log('Error processing the options Object', err);
    }
  }
};


//This will queury twitter to find out the username and userid associated with the credentials it was given
TwitterBot.prototype.initialize = function initialize(callback){
  console.log('TwitterBot.prototype.initialize called');
  new Promise((resolve, reject) => {
    console.log('inside initialize, this is', this);
    this.twit.get('account/verify_credentials', (err, data, response) => {
      if (err){
        return reject(err);
      }
      return resolve(data, response);
    });
  })
  .then((data, response) => {
    console.log('Request made to account/verify_credentials successfully');
    this.screen_name  = data.screen_name;
    this.user_id      = data.id_str;
    if (callback instanceof Function){
      callback(null, data, response);
    } else if (callback){
      console.log('Data coming in from account/verify_credentials is: ');
      console.log(data);
      console.log('Error, callback provided is not a function.');
    }
  })
  .catch((err) => {
    console.log('Error occured', err);
    if (callback){
      try{
        callback(err);
      } catch (e) {
        console.log(e);
      }
    }
  });
};


//This takes string to tweet, an optional callback, and an optional options object
//callback function takes error, data, and response as parameters in that order
//optional optionsObj has properties screenNameToTweetAt(string), tweetIdToReplyTo(string), fileUpload(Boolean, default false)
//TODO: figure out how to refactor so that if a callback isn't provided, it will return a promise
TwitterBot.prototype.tweet = function tweet(stringToTweet, callback, optionsObj){
  console.log('TwitterBot.prototype.tweet called');
  let postEndpoint = 'statuses/update';

  //build the object to post
  let postObj = {};
  postObj.status = stringToTweet;
  if(optionsObj){
    //TODO: build out file upload option
    // if (optionsObj.fileUpload){ //determines if it is a file upload
    //   postEndpoint
    // }
    if (optionsObj.screenNameToTweetAt){
      postObj.status = '@' + optionsObj.screenNameToTweetAt + ' ' + postObj.status;
      if (optionsObj.tweetIdToReplyTo){
        postObj.in_reply_to_status_id = optionsObj.tweetIdToReplyTo;
      }
    }
  }

  //try to make the call to twitter
  new Promise((resolve, reject) => {
    this.twit.post(postEndpoint, postObj, (err, data, response) => {
      if (err){
        return reject(err);
      }
      return resolve(data, response);
    });
  })
  .then((data, response) => {
    if (callback instanceof Function){
      callback(null, data, response);
    } else if (callback){
      console.log('Error, callback provided is not a function.');
    }
  })
  .catch((err) => {
    console.log(err);
    if(callback){
      try {
        callback(err);
      } catch (e) {
        console.log(e);
      }
    }
  });
};


//TODO: this is the function that runs to start a bot by name
TwitterBot.prototype.callMethodOnBot = function(botName, methodToCall, callback, botList){
  try { //if they provided a list to delete the bot from
    if (botList && this.bots[botList]){
      if(botName instanceof Array){ //if they provided a list of bots to start
        botName.forEach((currentBotName) => {
          if(this.bots[botList][currentBotName]){
            this.bots[botList][currentBotName][methodToCall](callback);
          } else {
            console.log('Error: could not find ' + );
          }
        });
        //TODO: refactor this so that it can tell if they provided a botName that wasn't found
        // Promise.all(botName.forEach((currentBotName) => {
        //   return new Promise((resolve, reject) => {
        //     if(this.bots[botList][botName]){
        //       this.bots[botList][botName].initialize();
        //       resolve();
        //     } else {
        //       reject(currentBotName + ' not found.');
        //     }
        //   });
        // }))
        // .then((data) => {
        //   if(callback instanceof Function){
        //     callback(data);
        //   } else {
        //     throw new Error('Callback not a function');
        //   }
        // })
        // .catch((err) => {
        //   throw new Error(err);
        // });
      } else if (typeof botName === 'string'){ //if they provided just a single bot to start
        if(this.bots[botList][botName]){
          this.bots[botList][botName][methodToCall](callback);
        }
      } else {
        throw new Error('Invalid botName type');
      }  
    } else { //if they didn't provide a list to delete the bot from
      if (botName instanceof Array){ //if they provided a list of bots to start
        botName.forEach((currentBotName) => {
          [this.bots.timerBots. this.bots.replyBots, this.bots.searchBots].forEach((currentBotList) => {
            if(currentBotList[currentBotName]){
              currentBotList[currentBotName][methodToCall](callback);
            }
          });
        });
      } else if (typeof botName === 'string'){ //if they provided just a single bot to start
        [this.bots.timerBots. this.bots.replyBots, this.bots.searchBots].forEach((currentBotList) => {
          if(this.bots[currentBotList][botName]){
            this.bots[currentBotList][botName][methodToCall](callback);
          }
        });
      } else {
        throw new Error('Invalid botName type');
      }
    }
  } catch (err){
    console.log('Error occured while starting bots:', err);
  }
};

TwitterBot.prototype.startBot = function(botName, callback, botList){
  this.callMethodOnBot(botName, 'initialize', callback, botList);
}

TwitterBot.prototype.stopBot = function(botName, callback, botList){
  this.callMethodOnBot(botName, 'stop', callback, botList);
}



//TODO: This is the handler that makes the appropriate functions run when a tweet event occurs
// TwitterBot.prototype._handleStreamingTweetEvent = function() {
//
//
//
// };





//This attaches the functions defined in the other js files to the TwitterBot prototype
//TODO: build these
// TwitterBot.prototype.defineSearchBot = require(__dirname + '/defineSearchBot.js')(this.twit);
// TwitterBot.prototype.defineReplyBot = require(__dirname + '/defineReplyBot.js')(this.twit);
