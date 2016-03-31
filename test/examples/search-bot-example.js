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
let searchBotDefinedCallback = function(error, botName) {
  searchBotExample.bots.searchBots.backwards_bot.initialize((err, botName) => {
    if (err) {
      console.log(err);
    } else {
      console.log( botName + ' started.');
    }
  });
};
let stringToSearchFor = 'spelled backwards';
//going to make the content of my tweets be the text of their tweet except backwards
let searchBotContent = function(tweet){
  console.log('searchBotContent called');
  return tweet.text.split('').reverse().join('');
};
searchBotExample.defineSearchBot(searchBotContent, stringToSearchFor, searchBotDefinedCallback, searchBotOptions);





let searchBotOptions2 = {
  botName: 'SDRAWKCAB_DNA',
  callback: function(err, data, response){
    if (err){
      console.log('Error posting content', err);
    } else {
      console.log('Should have succesfully posted a tweet with text: ');
      console.log(data.text);
    }
  }
};

let searchBotDefinedCallback2 = function() {
  searchBotExample.bots.searchBots.SDRAWKCAB_DNA.initialize((err, botName) => {
    if (err) {
      console.log(err);
    } else {
      console.log( botName + ' started.');
    }
  });
};
let stringToSearchFor2 = 'dna, science';
//going to make the content of my tweets be the text of their tweet except backwards
let searchBotContent2 = function(tweet){
  console.log('searchBotContent called');
  return tweet.text.toUpperCase();
};
searchBotExample.defineSearchBot(searchBotContent2, stringToSearchFor2, searchBotDefinedCallback2, searchBotOptions2);
