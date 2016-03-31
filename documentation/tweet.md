#TwitterBot.prototype.tweet(contentToTweet [,callback, options])

This tweets a string or file. 

-**contentToTweet**: String _Either a string to be tweeted or the path to a file to tweet._

-**callback**: Function _Runs after finished tweeting._

-**options**: Object _Determines the tweet settings._
  * **screenNameToTweetAt**: String _The screen name of the user to tweet at without the @ sign._
  * **tweetIdToReplyTo**: String _The id_str of the tweet this tweet should be a reply to. Ignored unless screenNameToTweetAt is present._
  * **fileUpload**: Boolean _Determines whether to treat the contentToTweet as a filepath or not (Defaults to false)._