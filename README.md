# twitter-bot

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

#Content you post

Make sure that your bot complies with Twitter's policies for general use and for the use of its API:
https://support.twitter.com/groups/56-policies-violations/topics/236-twitter-rules-policies/articles/18311-the-twitter-rules 
https://dev.twitter.com/overview/terms/policy
https://support.twitter.com/articles/76915


Twitter REST api description: 
https://dev.twitter.com/rest/public


#TwitterBot.prototype.tweet(contentToTweet [,callback, options])

This tweets a string or file. 

-**contentToTweet**: String _Either a string to be tweeted or the path to a file to tweet._

-**callback**: Function _Runs after finished tweeting._

-**options**: Object _Determines the tweet settings._
  * **screenNameToTweetAt**: String _The screen name of the user to tweet at without the @ sign._
  * **tweetIdToReplyTo**: String _The id_str of the tweet this tweet should be a reply to. Ignored unless screenNameToTweetAt is present._
  * **fileUpload**: Boolean _Determines whether to treat the contentToTweet as a filepath or not (Defaults to false)._
  
  
# defineTimerBot(content [, callback, options])

  Attaches a timerBot (a bot that performs an action on an interval) to the twitterBot instance.

  - **content**: String or Function that returns a String _Determines what will be posted to Twitter. If a function, takes arguments:_

  	-done: _Function, if content function is asynchronous, call done when complete on the string to be posted, like_ `done('tweet this');` 
  - **callback**: Function _Runs once bot is defined. Takes arguments:_

  	-error: _Error, if any. Is null if the bot was created successfully._
    
    -botName: _String, name of the bot created._
  - **options**: Object _Defines the bot's settings._
    * **interval**: Number _How often the bot posts (default 1 hr, minimum 1 minute)._
    * **callback**: Function _Runs each time the bot posts to Twitter. Takes arguments:_
    
    	-error: _The error, if any. Is null if the post was successful._
      
      -data: _The data of the response from Twitter. Text of the tweet can be found at data.text._
      
      -response: _The response from Twitter._
   * **dontStopOnError**: Boolean _Determines whether the bot will continue posting if it encounters an error (default False)._
    * **botName**: String _Name for the bot (default timerBot0 or other integer)._
    * **tweetOptions**: Object _(see TwitterBot.prototype.tweet)_
    
    
    

#TimerBot.prototype.initialize([callback])

  Starts up a bot so that it will post to Twitter.

  - **callback**: Function _Runs after the bot is turned on. Takes arguments:_

  	-running: Boolean, _Says whether the bot is running or not. False if an error occurred._ 

#TimerBot.prototype.stop([callback])
    
  Stops the bot from running so that it will no longer post to Twitter. Bot can be turned back on with initialize.

  - **callback**: Function _Runs after the bot is turned off. Takes arguments_

  	-running: Boolean, _Says whether the bot is running or not. False if an error occurred._ 


#defineSearchBot(content, stringToSearchFor [, callback, options])

Attaches a new search bot (a bot that searches for a phrase or set of phrases) to the twitterBot instance.

-**content**: String or a Function that returns a String. _Determines what will be posted to Twitter_.

-**stringToSearchFor**: String _Phrase or set of phrases for the bot to match to. See [Twitter's guide](https://dev.twitter.com/streaming/overview/request-parameters#track)._

-**callback**: Function
_Runs after bot is defined._

-**options**: Object _Defines the bot's settings._
  * **dontStopOnError**: Boolean _Determines whether the bot will continue posting if it encounters an eror (Defaults to false)._
  * **botName**: String _Name for the bot (Defaults to searchBot0 or other integer.)_
  * **postInReply**: Boolean _Whether to post in reply to the matched tweet or default to posting on the bot's page. (Defaults to false)_
  * **RESTOnly**: Boolean  _Whether to use the REST APIs or default to streaming APIs. (Defaults to false)_
  * **interval**: Number _How often the bot looks for matches with REST. (default 1 hr, minimum 1 minute) (Ignored unless RESTOnly enabled)_
  * **tweetOptions**: Object _(see TwitterBot.prototype.tweet)_
  * **callback**: Function _Runs every time the bot posts to Twitter._
  
#SearchBot.prototype.initialize([callback])
  
Starts the bot running. 
  
-**callback**: Function _Runs after the bot is turned on._
  
#SearchBot.prototype.stop([callback])
  
Stops the bot from running. Can be turned back on with initialize.

-**callback**: Function _Runs after the bot is turned off._


#defineReplyBot(content[, callback, options])

Attaches a new reply bot (a bot that replies to mentions) to the twitterBot instance.

-**content**: String or a Function that returns a String. _Determines what will be posted to Twitter_.

-**callback**: Function
_Runs after bot is defined. Takes arguments:_

-error: Error._Is null if the bot was created successfully._
-error: _String, name of the bot created._
  

-**options**: Object. _Defines the bot's settings._
  * **dontStopOnError**: Boolean. _Determines whether the bot will continue posting if it encounters an error (Defaults to false)._
  * **botName**: String. _Name for the bot (Defaults to replyBot0 or other integer.)_
  * **treatRepliesAsDiscinct**: Boolean. _Whether to respond to replies to your tweets as mentions or not (Defaults to true)._
  * **RESTOnly**: Boolean.  _Whether to use the REST APIs or default to streaming APIs (Defaults to false)._
  * **interval**: Number. _How often the bot looks for matches with REST. (default 1 hr, minimum 1 minute) (Ignored unless RESTOnly enabled)_
  * **tweetOptions**: Object. _(see TwitterBot.prototype.tweet)_
  * **callback**: Function. _Runs every time the bot posts to Twitter. Takes arguments:_
  
  -error: Error. _Is null if the post was successful._
    
  -data: String. _The data object from Twitter. Text of the tweet can be found at data.text._
    
  -response: Object. _The response object from Twitter._
    
#SearchBot.prototype.initialize([callback])
  
Starts the bot running. 
  
-**callback**: Function. _Runs after the bot is turned on. Takes arguments:_
	
  -running: Boolean. _Says whether the bot is running or not. False if an error occurred._ 
  
#SearchBot.prototype.stop([callback])
  
Stops the bot from running. Can be turned back on with initialize.

-**callback**: Function. _Runs after the bot is turned off. Takes arguments:_
	
  -running: Boolean, _Says whether the bot is running or not. False if an error occurred._ 
