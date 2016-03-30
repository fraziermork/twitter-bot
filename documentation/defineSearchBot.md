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