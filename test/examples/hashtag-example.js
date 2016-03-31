'use strict';
let TwitterBot = require(__dirname + '/../../lib/twitter-bot.js');
let hashBotExample = new TwitterBot();

let hashBotOptions = {
  botName: 'yes_im_a_bot',
  callback: function(err, data, response) {
    if(err) {
      console.error(err);
    } else {
      console.log('Here is the text');
      console.log(data.text);
    }
  }
};

let hashBotDefinedCallback = function(err, botName) {
  hashBotExample.bots.searchBots.yes_im_a_bot.initialize((err, botName) => {
    if(err) {
      console.error(err);
    } else {
      console.log(botName + ' started');
    }
  })
}
