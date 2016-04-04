'use strict';
let _ = require('lodash');




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
  
  
  // TwitterBot.prototype.attachDataToTweet = function(){
  //   console.log('TwitterBot.prototype.attachDataToTweet called');
  //   
  //   
  // };




  //This takes a tweet and attaches a property, processed_tweet_text, to the tweet object containing the text of the tweet with those entities removed
  TwitterBot.prototype.produceProcessedTweetText = function(tweet){
    console.log('TwitterBot.prototype.produceProcessedTweetText called');
    
    
    //this is the string we are building to return
    let textWithoutEntities = _.deburr(tweet.text); //TODO: enable option to not deburr, also look into how this interacts with non-english languages, maybe make it so that this isn't automatically used if not specifically looking for english?
    console.log('textWithoutEntities is ', textWithoutEntities);
    
    //define the information that will be used to eliminate entities from the text body
    let removalInfo = {
      urls: {
        propToRemove: 'display_url',
        stringToPrepend: '', 
        optionToCheck: this.removeUrlsFromTweets
      }, 
      user_mentions: {
        propToRemove: 'screen_name',
        stringToPrepend: '@',
        optionToCheck:this.removeMentionsFromTweets
      }, 
      hashtags:{
        propToRemove: 'text',
        stringToPrepend: '#',
        optionToCheck:this.removeHashtagsFromTweets
      }, 
      symbols: {
        propToRemove: 'text',
        stringToPrepend: '$',
        optionToCheck:this.removeSymbolsFromTweets
      }, 
      extended_entities: {
        propToRemove: 'display_url',
        stringToPrepend: '', 
        optionToCheck: this.removeExtendedEntitiesFromTweets
      }, 
      media: {
        propToRemove: 'display_url',
        stringToPrepend: '', 
        optionToCheck: this.removeMediaFromTweets
      }
    };
    
    //iterate through each entity type and remove it from the tweet text
    Object.keys(removalInfo).forEach((currentEntityTypeName) => {
      if (this[currentEntityTypeName]['optionToCheck']){
        console.log('Replace enabled for ' + currentEntityTypeName);
        tweet.entities[currentEntityTypeName].forEach((currentEntityObj) => {
          let propToRemove = removalInfo[currentEntityTypeName]['propToRemove'];
          let stringToPrepend = removalInfo[currentEntityTypeName]['stringToPrepend'];
          let StringToReplace = stringToPrepend + currentEntityObj[propToRemove];
          console.log('StringToReplace is ', StringToReplace);
          textWithoutEntities = textWithoutEntities.replace(StringToReplace, '', 'ig');
          return;
        });
      } else {
        return;
      }
    });
    
    //assign the fully replaced text as a new property on the tweet object
    tweet.processed_tweet_text = textWithoutEntities;
    console.log('textWithoutEntities is ' + textWithoutEntities);
    return tweet; //return tweet for chaining, testing
  };
};
