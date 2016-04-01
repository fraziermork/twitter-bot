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
