# defineTimerBot(content [, callback, options])

Attaches a timerBot (a bot that performs an action on an interval) to the twitterBot instance.

- content: String or Function that returns a string
- callback: (function to run once bot defined)
- options: object
  * interval: (default 1 hr, minimum 1 minute)
  * callback: (function to run after each post)
  * dontStopOnError: (default False)
  * botName: (default timerBot1 or other integer)
  * tweetOptions: (options for tweeting, see TwitterBot.prototype.tweet)
  
  
  

#TimerBot.prototype.initialize([callback])

Starts a bot running

- callback: function to run after the bot is initialized
