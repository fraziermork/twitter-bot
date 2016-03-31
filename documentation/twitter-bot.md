#How to use this module

The code below demonstrates a simple version of how to use this module. For more thorough examples, see the examples inside the ~./tests/examples directory.


```
let TwitterBot = require('twitter-bot');
let twitterBot = new TwitterBot();
  
let tweetFunction = () => {
  let now = new Date();
  return now.toISOString();
}

let callbackFunction = (err, botName) => {
  if (err) {
    console.log(err);
  } else {
    console.log(botName + ' created.');
  }
}

let timerBotOptions = {interval: 60000};

twitterBot.defineTimerBot(tweetFunction, callbackFunction, {interval: 60000});
  
twitterBot.initialize();
 
```
 
The code above will define a simple twitter bot that tweets the current time every minute. If this file were called simple-example-bot.js, you could run this from the terminal by running

`node simple-example-bot.js`

This won't work until you enter your authentication keys for twitter. See the Authentication Keys section below. 

#Authentication Keys

#####Getting your authentication keys

You will need to get authentication keys for your twitter account from Twitter. You should be careful not to commit these keys--if you do, anyone could potentially gain access to tweet from your account. 

First, log into your twitter account and make sure it has a phone number connected to it. If it doesn't, you'll need to add one in the 'mobile' section of your settings before proceeding. If you already have a Twitter account linked to your phone number, you can delete it from that account and use it for this bot account for the next steps.  

Then, go to [apps.twitter.com](apps.twitter.com) and click 'Create New App.' This will take you to a form to enter some information about your app. You can enter anything you want here. For a website, I just used the github page for my project. You don't need to enter a callback url. 

Once this is done, it will take you to another page listing the details of your newly-created app. Navigate over to the 'Keys an Access Tokens' tab. Save these keys somewhere safe, preferably outside of your git repository so that they aren't accidentally commited. 

#####Inputting your authentication keys

To reduce the liklihood of a security breach, twitter-bot reads in all authentication keys from the process environment. To set your keys for a single instance of your terminal window, write 

```
export TWITTER_CONSUMER_KEY=<your consumer key here>
export TWITTER_CONSUMER_SECRET=<your consumer secret here>
export TWITTER_ACCESS_TOKEN=<your access token here>
export TWITTER_ACCESS_TOKEN_SECRET=<your access token secret here>
```
This will set your keys as environment varialbes local to a single terminal window--they won't be accessible from any other terminal windows and will be lost when that window is closed. See the deploying section for information on how to set these keys in the environment you deploy to. 

#Bot types

This module supports three commonly supported types of bots: timer bots, reply bots, and search bots. 

#####Timer Bots

Timer bots are any bot that posts things to twitter at a regular interval. A well known bot like this was [@everyword](https://twitter.com/everyword?lang=en), which tweeted one word from the english dictionary every half hour from 2008 - 2014. For a currently tweeting example, see [@fuckeveryword](https://twitter.com/fuckeveryword?lang=en). 

#####Reply Bots

Reply bots are bots that look for mentions of their username and reply back, like [@DearAssistant](https://twitter.com/dearassistant), which answers questions directed at it.  

#####Text search bots

Search bots search Twitter for any phrase (or set of phrases) and either reply back or post to their own page, like [@Betelgeuse_3](https://twitter.com/betelgeuse_3) or [@boy2bot](https://twitter.com/boy2bot).

#####Other bots

Bots that respond to external events, like [@earthquakesSF](https://twitter.com/earthquakesSF), can just call `twitterBot.tweet()`, the tweeting function built into this module, as appropriate. 
