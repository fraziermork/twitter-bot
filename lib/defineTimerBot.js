'use strict';


TimerBot.prototype.initialize = (twitterBot)=>{
  (function looping (){
    try {
      console.log('setting interval');
      let stringToTweet;
      if(this.content instanceof Function){
        stringToTweet = this.content();
      } else if(this.content instanceof String || this.content instanceof Number) {
        stringToTweet = this.content;
      } else{
        throw new Error('invalid content type');
      }
      new Promise(function(resolve, reject){
        this.twit.post('statuses/updates', stringToTweet,function(err, data, response){
          if (err){
            return reject(err);
          }
          return resolve(data, response);
        });
      }).then((data, response)=>{
        if(callback instanceof Function){
          callback(null, data, response);
          setTimeout(looping, this.interval);
        } else if(callback){
          throw new Error('Error: Callback is not a function');
        }
      })
      .catch((err)=>{
        throw new Error(err);
      });
    } catch(error){
      console.log(error);
      if(noBreakOnError){
        setTimeout(looping, interval);
      }
    }
  })();

};

let defineTimerBot = module.exports = function(twit){
  return function(content, callback, optionObj){
    let interval = 3600000;
    let noBreakOnError = false;
    if (optionObj){
      if(optionObj.noBreakOnError === true){
        noBreakOnError = optionObj.noBreakOnError;
      }
      if(optionObj.interval){
        if(optionObj.interval >= 60000){
          interval = optionObj.interval;
        } else {
          interval = 60000;
        }
      }
    }
    (function looping (){
      try {
        console.log('setting interval');
        let stringToTweet;
        if(content instanceof Function){
          stringToTweet = content();
        } else if(content instanceof String || content instanceof Number) {
          stringToTweet = content;
        } else{
          throw new Error('invalid content type');
        }
        new Promise(function(resolve, reject){
          twit.post('statuses/updates', stringToTweet,function(err, data, response){
            if (err){
              return reject(err);
            }
            return resolve(data, response);
          });
        }).then((data, response)=>{
          if(callback instanceof Function){
            callback(null, data, response);
            setTimeout(looping, interval);
          } else if(callback){
            throw new Error('Error: Callback is not a function');
          }
        })
        .catch((err)=>{
          throw new Error(err);
        });
      } catch(error){
        console.log(error);
        if(noBreakOnError){
          setTimeout(looping, interval);
        }
      }
    })();
  };
};
