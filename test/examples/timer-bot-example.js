'use strict';
let TwitterBot = require(__dirname + '/../../lib/twitter-bot.js');
let timerBotExample = new TwitterBot();

let timerBotOptions = {
  interval: 60000,
  callback: (err, data, response) => {
    if (err) {
      console.log('Error occured:', err);
    }
    console.log('Post made to twitter:', data.text);
  }
};

function timerBotCallback(err, botName){
  timerBotExample.bots.timerBots[botName].initialize(function(botRunning) {
    console.log(botName + ' is now running: ' + botRunning);
  });
}

timerBotExample.defineTimerBot(function(){
  let now = new Date();
  return now.toISOString();
}, timerBotCallback, timerBotOptions);
