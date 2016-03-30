'use strict';
let TwitterBot = require(__dirname + '/../../lib/twitter-bot.js');
let timerBotExample = new TwitterBot();
let i = 0;


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
  timerBotExample.bots.timerBots[botName].initialize(function(nameOfBotStarted) {
    console.log('Name of bot built is the same as the bot that was started:');
    console.log(botName === nameOfBotStarted);
  });
}

timerBotExample.defineTimerBot('Hello world ' + i++, timerBotCallback, timerBotOptions);

console.log('Number of timer bots running:');
console.log('timerBotExample.bots.timerBots.counter');
console.log(timerBotExample.bots.timerBots.counter);
