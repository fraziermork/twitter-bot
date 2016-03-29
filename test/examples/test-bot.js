'use strict';
let TwitterBot = require(__dirname + '/../../lib/twitter-bot.js');

let twitterBot = new TwitterBot();
console.dir(twitterBot);

twitterBot.initialize();
twitterBot.tweet('Hello world', function(err, data, response) {
  console.log('Successfully made call');
  console.log(err, data, response);
}, {
  screenNameToTweetAt: 'doceyDraxton'
});
