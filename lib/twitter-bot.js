'use strict';
let Twit    = require('twit');
let keys    = require(__dirname + '/../config/config.js');



//this is the constructor function for a new TwitterBot
//optionsObj has properties RESTOnly(Boolean, default false), SafeMode(Boolean, default true)
let TwitterBot = module.exports =  function(optionsObj){
  //General properties
  this.screen_name                = null; //screenname of the bot associated with credentials provided
  this.user_id                    = null; //twitter id of the bot associated with credentials provided
  this.twit                       = new Twit(keys); //TODO: switch how we do this to inside constructor?
  this.classList                  = []; //list that says what kind of bots are attached to this TwitterBot, like ['timerBot', 'searchBot']
  this.SafeMode                   = true;
  this.RESTOnly                   = false;
  this.bots                       = {};
  this.bots.timerBots             = {};
  this.bots.replyBots             = {};
  this.bots.searchBots            = {};
  this.TimerBot                   = TimerBot;


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

//TODO: This is the handler that makes the appropriate functions run when a tweet event occurs
// This.prototype._handleStreamingTweetEvent = function() {
//
//
//
// };

//This attaches the functions defined in the other js files to the TwitterBot prototype
//TODO: build these
TwitterBot.prototype.defineTimerBot = require(__dirname + '/defineTimerBot.js')(this);//TODO:may need arrow function?
function TimerBot(optionObj, content){
  this.interval = 3600000;
  this.noBreakOnError = false;
  this.content = content;
  if (optionObj){
    if(optionObj.noBreakOnError === true){
      this.noBreakOnError = optionObj.noBreakOnError;
    }
    if(optionObj.interval){
      if(optionObj.interval >= 60000){
        this.interval = optionObj.interval;
      } else {
        this.interval = 60000;
      }
    }
  }
}
TimerBot.prototype.tweet = TwitterBot.prototype.tweet;
// TwitterBot.prototype.defineSearchBot = require(__dirname + '/defineSearchBot.js')(this.twit);
// TwitterBot.prototype.defineReplyBot = require(__dirname + '/defineReplyBot.js')(this.twit);
