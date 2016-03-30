
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
  
  //properties pulled in from optionsObj
  if(optionsObj){
    try {
      this.SafeMode                   = optionsObj.SafeMode !== false; //will filter all tweets for NSFW content before posting
      this.RESTOnly                   = optionsObj.RESTOnly || false; //tells all functions to default to using REST apis only, no streaming APIs will be used
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
  this._TimerBot                   = require(__dirname + '/defineTimerBot.js')(this);
  this._ReplyBot                   = require(__dirname + '/defineReplyBot.js')(this);
  // this._SearchBot                  = require(__dirname + '/defineSearchBot.js')(this);

  //properties related to using REST apis
  this.tweetIdsRepliedTo          = []; //list of tweet ids we have replied to so that we don't double reply when using the REST apis to reply to tweets
  this.tweetIdsThatMatchedSearch  = []; //list of tweet ids that matched the search parameters so that we don't double reply when using the REST apis to search tweets

  //properties replated to using streaming apis
  this.streamingSearchParameters  = []; //full list of all search terms, max length 60 bytes so be careful!
  this.streamingApiRouter         = {}; //this is the router used to determine which function should be attached to which match result
  this._searchStream              = null;

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
  this.callMethodOnBot(botName, 'initialize', callback, botList);
};


//this stops a given bot or an array of bots from running
TwitterBot.prototype.stopBot = function(botName, callback, botList){
  this.callMethodOnBot(botName, 'stop', callback, botList);
};

//TODO: finish this function, meant to allow users to get a bot by name so that they can modify it if they want.
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







// //TODO: This is the handler that makes the appropriate functions run when a tweet event occurs
// //This parses the tweet to see which of the handlers it relates to, then calls the associated handler
// //gets added as the function to run on 'tweet' events to the TwitterBot._searchStream coming in
// TwitterBot.prototype._handleStreamingTweetEvent = function() {
//
//
//
// };




// // TODO: The purpose of this function is to update the parameters being tracked by the streaming API
// //needs to go through all of the bots listed as running, grab their search parameters, assemble them into one coherent string formatted for twitter's track, and pass it in as an option
// //should check to make sure that the total list of things being tracked is under the 60 byte limit or throw an error
// //should return the new streaming parameters for testing purposes
// TwitterBot.prototype._updateStreamingParameters = function(){
//   
//
// };




// //TODO: This is the function that will run to restart the stream
// //Need to make sure that this will work to update the parameters that it is searching based on 
// TwitterBot.prototype._restartStream = function (newTrackOptions){
//   this._searchStream.stop();
//   this._searchStream.reqOpts = newTrackOptions;
//   this._searchStream.start();
// };
