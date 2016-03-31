
'use strict';
const Twit        = require('twit');
const _           = require('lodash');
const apiKeys     = require(__dirname + '/../config/config.js');

//this is the constructor function for a new TwitterBot
//optionsObj has properties RESTOnly(Boolean, default false), SafeMode(Boolean, default true)
const TwitterBot = module.exports =  function(optionsObj){
  //General properties
  this.screen_name                = null; //screenname of the bot associated with credentials provided
  this.user_id                    = null; //twitter id of the bot associated with credentials provided
  this.twit                       = new Twit(apiKeys); 
  this.SafeMode                   = true; //TODO: implement this
  this.RESTOnly                   = false; //TODO: implement RESTOnly versions of bots
  this.filterByLang               = true;
  this.acceptableLang             = 'en';
  this.testMode                   = false;
  
  //properties pulled in from optionsObj
  if(optionsObj){
    try {
      this.SafeMode               = optionsObj.SafeMode !== false; //will filter all tweets for NSFW content before posting
      this.RESTOnly               = optionsObj.RESTOnly || false; //tells all functions to default to using REST apis only, no streaming APIs will be used
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
  this._streamingSearchParameters = []; //full array of all search terms, max length 60 bytes so be careful!
  this._stringToTrack             = null;
  this._streamingApiRouter        = {}; //this is the router used to determine which function should be attached to which match string, key pairs are match strings:searchBot
  this._searchStream              = null;

};






//This will queury twitter to find out the username and userid associated with the credentials it was given
//TODO: make this call initialize on every bot
TwitterBot.prototype.initialize = function initialize(callback){
  console.log('TwitterBot.prototype.initialize called');
  new Promise((resolve, reject) => {
    // console.log('inside initialize, this is', this);
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
//TODO: configure this so that they can pass in tweet options to the TwitterBot constructor that will be applied to all tweets unless specifically overriden
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
  
  if(this.testMode){
    return;
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
            console.log('Error: could not find ' + currentBotName);
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
          this.bots.botLists.forEach((currentBotList) => {
            if(currentBotList[currentBotName]){
              currentBotList[currentBotName][methodToCall](callback);
            }
          });
        });
      } else if (typeof botName === 'string'){ //if they provided just a single bot to start
        this.bots.botLists.forEach((currentBotList) => {
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

//this starts a given bot or an array of bots running
TwitterBot.prototype.startBot = function(botName, callback, botList){
  console.log('TwitterBot.prototype.startBot called');
  this.callMethodOnBot(botName, 'initialize', callback, botList);
};


//this stops a given bot or an array of bots from running
TwitterBot.prototype.stopBot = function(botName, callback, botList){
  console.log('TwitterBot.prototype.stopBot called');
  this.callMethodOnBot(botName, 'stop', callback, botList);
};



//TODO: finish this function, meant to allow users to get a bot by name so that they can modify it if they want.
//TODO: it's probably ok to just force them to specify the botList too, especially at MVP level
// TwitterBot.prototype.getBot = function(botName, botList){
//   try {
//     if(botList && this.bots[botList]){ //if they provided the list the bot is in
//       if(botName instanceof Array){
//         return botName.map((currentBotName) => {
//           if (this.bots[botList][currentBotName]){
//             return this.bots[botList][currentBotName];
//           } else {
//             throw new Error(currentBotName + ' not found.');
//           }
//         });
//       } else if (typeof botName === 'string'){
//         if (this.bots[botList][botName]){
//           return this.bots[botList][botName];
//         } else {
//           throw new Error(botName + ' not found.');
//         }
//       } else {
//         throw new Error('Invalid botName type');
//       }
//     } else { //if they just provided the botName
//       if(botName instanceof Array){
//         return botName.map((currentBotName) => {
//           
//           for(var i = 0; i < this.bots.botLists.length; i++){
//             
//           }
//           
//           
//         })
//       } else if (typeof botName === 'string') {
//         
//         let returnArray = [];
//         for(var i = 0; i < this.bots.botLists.length; i++){
//           if(this.bots.botLists[i][botName]){
//             returnArray.push(this.bots.botLists[i][botName]);
//           }
//         }
//         return returnArray;  
//         
//       } else {
//         throw new Error('Invalid botName type');
//       }
//       
//       
//     }
//     
//   } catch (err){
//     console.log('Error occured:', err);
//     return err;
//   }
// }; 



// // TODO: The purpose of this function is to update the parameters being tracked by the streaming API
// //needs to go through all of the bots listed as running, grab their search parameters, assemble them into one coherent string formatted for twitter's track, and pass it in as an option
// //should check to make sure that the total list of things being tracked is under the 60 byte limit or throw an error
// //should return the new streaming parameters for testing purposes

TwitterBot.prototype._updateStreamingSearchParameters = function(){
  console.log('TwitterBot.prototype._updateStreamingSearchParameters called');
  let arrayOfTextSearchParameters = this._collectAllSearchBotMatchStrings() || [];
  let replyBotRunningFlag         = this._checkIfAReplyBotIsRunning();
  console.log('arrayOfTextSearchParameters ', arrayOfTextSearchParameters);
  console.log('replyBotRunningFlag ', replyBotRunningFlag);
  console.log('SCREEN NAME IS _______________________' + this.screen_name);
  if (replyBotRunningFlag){
    arrayOfTextSearchParameters.push('@' + this.screen_name);
  }
  this._streamingSearchParameters  = arrayOfTextSearchParameters;
  this._stringToTrack              = this._streamingSearchParameters.join();
  console.log('TwitterBot.prototype._updateStreamingSearchParameters finished');
  console.log('this._streamingSearchParameters is ', this._streamingSearchParameters);
  console.log('this._stringToTrack is', this._stringToTrack);
};


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
  
  //sets the reply bot to the screen name as a key
  let activeReplyBotName = Object.keys(self.bots.replyBots).filter((currentReplyBotName) => {
    let currentReplyBot = self.bots.replyBots[currentReplyBotName];
    return currentReplyBot instanceof Object && currentReplyBot._running && !currentReplyBot.RESTOnly;
  })[0];
  console.log('activeReplyBotName is ' + activeReplyBotName);
  
  self._streamingApiRouter['@' + self.screen_name] = self.bots.replyBots[activeReplyBotName];
  
  console.log('active reply bot is ', self.bots.replyBots[activeReplyBotName]);
  
  //builds out the search terms in the router
  Object.keys(this.bots.searchBots).forEach((currentSearchBotName) => {
    console.log('currentSearchBotName is ', currentSearchBotName);
    let currentSearchBot = this.bots.searchBots[currentSearchBotName];
    console.log('currentSearchBot is ', currentSearchBot);
    console.log(currentSearchBot instanceof Object);
    console.log(currentSearchBot._running);
    if(!(currentSearchBot instanceof Object) || !currentSearchBot._running || currentSearchBot.RESTOnly){ //the only strings that get attached to the router are those from bots that are running
      console.log('currentSearchBot failed test, going to return out');
      return;
    }
    console.log('currentSearchBot passed test, going to assign match string');
    currentSearchBot._matchStrings.forEach((currentMatchString) => {
      console.log('currentMatchString is ', currentMatchString);
      self._streamingApiRouter[currentMatchString] = currentSearchBot;
    });
  });
  console.log('this._streamingApiRouter is ');
  console.dir(this._streamingApiRouter);
};

//This is the function used to start the stream used to communicate with twitter
TwitterBot.prototype._startApiStream = function(){
  console.log('TwitterBot.prototype._startApiStream called');
  console.log('this.bots.searchBots is:');
  console.log(this.bots.searchBots);
  let self = this;
  self._updateStreamingSearchParameters();
  self._updateStreamingApiRouter();
  console.log('self._stringToTrack is ' + self._stringToTrack);
  self._searchStream = self.twit.stream('statuses/filter', {track: self._stringToTrack});
  self._searchStream.on('tweet', function(tweet) {
    console.log('tweet occured ', tweet.text);
    self._handleStreamingTweetEvent(tweet);
  });
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
  if(this._checkIfAReplyBotIsRunning()){ //TODO: rename to _checkIfAStreamingReplyBotIsRunning
    if(tweet.text.includes('@' + this.screen_name)){
      return this._streamingApiRouter['@' + this.screen_name]._handleTweet(tweet);
    }
  }
  if (tweet.user.screen_name === this.screen_name){
    console.log('Tweet event was caused by this bot');
    return;
  }
  if(this.filterByLang && !(this.acceptableLang === tweet.lang)){
    console.log('Tweet did not match language requirement.');
    return;
  }
  
  
  
  for (var i = 0; i < this._streamingSearchParameters.length; i++) {
    if (tweet.text.includes(this._streamingSearchParameters[i])){
      console.log('It included the word ' + this._streamingSearchParameters[i]);
      return this._streamingApiRouter[this._streamingSearchParameters[i]]._handleTweet(tweet);
    }
  }
};









// //TODO: This is the function that will run to restart the stream
// //Need to make sure that this will work to update the parameters that it is searching based on 
// TwitterBot.prototype._restartStream = function (newTrackOptions){
//   this._searchStream.stop();
//   this._searchStream.reqOpts = newTrackOptions;
//   this._searchStream.start();
// };
