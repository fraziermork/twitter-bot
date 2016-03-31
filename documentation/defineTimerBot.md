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