'use strict';

let defineTimerBot = module.exports = function(twit){
  return function(content, callback, optionObj){
    let interval = 3600000;
    if (optionObj){
      if(optionObj.interval){
        if(optionObj.interval >= 60000){
          interval = optionObj.interval;
        } else {
          interval = 60000;
        }
      }
    }
    setInterval(function (){
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
          } else if(callback){
            throw new Error('Error: Callback is not a function');
          }
        })
        .catch((err)=>{
          throw new Error(err);
        });
      } catch(error){
        console.log(error);
      }
    },interval);
  };
};
