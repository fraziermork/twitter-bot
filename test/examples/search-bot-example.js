'use strict';
let TwitterBot = require(__dirname + '/../../lib/twitter-bot.js');
let searchBotExample = new TwitterBot();

let searchBotOptions = {
  botName: 'backwards_bot',
  callback: function(err, data, response){
    if (err){
      console.log('Error posting content', err);
    } else {
      console.log('Should have succesfully posted a tweet with text: ');
      console.log(data.text);
    }
  }
};

let searchBotDefinedCallback = function() {
  searchBotExample.bots.searchBots.backwards_bot.initialize((err, botName) => {
    if (err) {
      console.log(err);
    } else {
      console.log( botName + ' started.');
    }
  });
};

let stringToSearchFor = 'backwards';

//going to make the content of my tweets be the text of their tweet except backwards
let searchBotContent = function(tweet){
  console.log('searchBotContent called');
  return tweet.text.split('').reverse().join('');
};

searchBotExample.defineSearchBot(searchBotContent, stringToSearchFor, searchBotDefinedCallback, searchBotOptions);
