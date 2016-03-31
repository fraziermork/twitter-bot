'use strict';

let Twit = require('twit');
let keys = require(__dirname + '/config2.js');
let t = new Twit(keys);


let searchQuery = 'jaws';

let tweets;
//arrays to hold all the search data
let newResults= [];
let tweetId = {};
let arrayURL = [];
let arrayHashTag = [];
let arrayMentions = [];




function searchTweet (query){
  t.get('search/tweets', {q: searchQuery ,result_type: 'recent', lang: 'en', count: 10}, function(err, data, response){
    console.log('******* NEW ARRAY *******');
    tweets = data.statuses;
    for(var i = 0; i < tweets.length; i++) {
      var currentTweet = tweets[i];
      if(!tweetId[currentTweet.id_str]){
        tweetId[currentTweet.id_str] = true;
        var tweetObj = {};
        tweetObj.text = currentTweet.text;
        console.log('TEXT: ' + currentTweet.text);
        tweetObj.user = currentTweet.user.screen_name;
        console.log('USER: ' + currentTweet.user.screen_name);
        tweetObj.source = currentTweet.source;
        console.log('SOURCE: ' + currentTweet.source);
        tweetObj.created_at = currentTweet.created_at;
        console.log('CREATED: ' + currentTweet.created_at);

        tweetObj.id = currentTweet.id_str;
        console.log('TWEETID: ' + currentTweet.id_str);
        if(tweets[i].entities.urls.length){
          console.log('URL: ' + currentTweet.entities.urls[0].url);
          tweetObj.URL = currentTweet.entities.urls[0].url;
        }
        if(tweets[i].entities.hashtags.length){
          console.log('HASHTAG: #' + currentTweet.entities.hashtags[0].text);
        }
        if(currentTweet.entities.user_mentions.length){
          console.log('MENTIONS: @' + currentTweet.entities.user_mentions[0].screen_name);
        }

        newResults.push(tweetObj);
      }

    }


  });
}
searchTweet();

// console.log('NEW RESULTS: ' + newResults[0]);

//URL array
function searchURL (query){
  t.get('search/tweets', {q: searchQuery, count: 10}, function(err, data, response){
    console.log('***** URLS *********');
    tweets = data.statuses;
    for(var i = 0; i < tweets.length; i++) {
      var resultUrl;
      if(tweets[i].entities.urls.length){
        console.log(tweets[i].entities.urls[0].url);
        resultUrl = tweets[i].entities.urls[0].url;

        arrayURL.push(resultUrl);
      }
    }

  });

}

searchURL();

//hash tag array
function searchHashTag (query){
  t.get('search/tweets', {q: searchQuery, count: 10}, function(err, data, response){
    console.log('***** HASHTAGS *********');
    tweets = data.statuses;
    for(var i = 0; i < tweets.length; i++) {
      var resultHashTag = {};
      if(tweets[i].entities.hashtags.length){
        console.log(tweets[i].entities.hashtags[0].text);
        resultHashTag.text = tweets[i].entities.hashtags[0].text;
        resultHashTag.indices = tweets[i].entities.hashtags[0].indices;
        console.log('HT IN: ' + tweets[i].entities.hashtags[0].text);
        arrayHashTag.push(resultHashTag);
      }
    }
  });
}
searchHashTag();

//Mentions array
function searchMentions (query){
  t.get('search/tweets', {q: searchQuery, count: 10}, function(err, data, response){
    console.log('*****Mentions*********');
    tweets = data.statuses;
    for(var i = 0; i < tweets.length; i++) {
      if(tweets[i].entities.user_mentions.length){
        var resultMentions = {};
        resultMentions.userName = tweets[i].entities.user_mentions[0];
        console.log('USER MENTIONS: ' + tweets[i].entities.user_mentions[0].screen_name);
        arrayMentions.push(resultMentions);
      }
    }
  });

}

searchMentions();
