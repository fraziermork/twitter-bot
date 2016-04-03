'use strict';

module.exprots = function(TwitterBot){
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
      console.log('Safemode enabled: would have tweeted:');
      console.log(postObj.status);
      return;
    }

    //try to make the call to twitter
    //TODO: refactor this
    
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

  
  
  
};
