'use strict';
let TwitterBot = require(__dirname + '/../../lib/twitter-bot.js');
let replyBotExample = new TwitterBot();

let replyBotOptions = {
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
let replyBotDefinedCallback = function(error, botName) {
  replyBotExample.initialize(function(e, botName){
    replyBotExample.bots.replyBots.backwards_bot.initialize((err, botName) => {
      if (err) {
        console.log(err);
      } else {
        console.log( botName + ' started.');
      }
    });
  });
};

//going to make the content of my tweets be the text of their tweet except backwards
let replyBotContent = function(tweet){
  console.log('searchBotContent called');
  return tweet.text.split('').reverse().join('');
};
replyBotExample.defineReplyBot(replyBotContent, replyBotDefinedCallback, replyBotOptions);
