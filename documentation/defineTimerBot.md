# defineTimerBot(content [, callback, options])

Attaches a timerBot (a bot that performs an action on an interval) to the twitterBot instance.

- **content**: String or Function that returns a String _Determines what will be posted to Twitter._
- **callback**: Function _Runs once bot is defined._
- **options**: Object _Defines the bot's settings._
  * **interval**: Number _How often the bot posts (default 1 hr, minimum 1 minute)._
  * **callback**: Function _Runs each time the bot posts to Twitter._
  * **dontStopOnError**: Boolean _Determines whether the bot will continue posting if it encounters an error (default False)._
  * **botName**: String _Name for the bot (default timerBot0 or other integer)._
  * **tweetOptions**: Object _(see TwitterBot.prototype.tweet)_
  
  
  

#TimerBot.prototype.initialize([callback])

Starts a bot running

- **callback**: Function _Runs after the bot is turned on._

#TimerBot.prototype.stop([callback])
  
Stops the bot from running. Can be turned back on with initialize.

- **callback**: Function _Runs after the bot is turned off._
