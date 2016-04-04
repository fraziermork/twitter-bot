'use strict';

module.exports = function(TwitterBot){
  console.log('bot-handlers.js required in');
  
  
  //This will queury twitter to find out the username and userid associated with the credentials it was given
  //TODO: make this call initialize on every bot
  TwitterBot.prototype.initialize = function initialize(callback){
    // console.log('TwitterBot.prototype.initialize called');
    new Promise((resolve, reject) => {
      // console.log('inside initialize, this is', this);
      this.twit.get('account/verify_credentials', (err, data, response) => {
        if (err){
          return reject(err);
        }
        return resolve(data, response);
      });
    })
    .then((data, response) => {
      // console.log('Request made to account/verify_credentials successfully');
      this.screen_name  = data.screen_name;
      this.user_id      = data.id_str;
      if (callback instanceof Function){
        callback(null, data, response);
      } else if (callback){
        // console.log('Data coming in from account/verify_credentials is: ');
        // console.log(data);
        // console.log('Error, callback provided is not a function.');
      }
    })
    .catch((err) => {
      console.log('Error occured', err);
      if (callback){
        try{
          callback(err);
        } catch (e) {
          console.log(e);
        }
      }
    });
  };




  //TODO: this is the function that runs to start a bot by name
  TwitterBot.prototype.callMethodOnBot = function(botName, methodToCall, callback, botList){
    try { //if they provided a list to delete the bot from
      if (botList && this.bots[botList]){
        if(botName instanceof Array){ //if they provided a list of bots to start
          botName.forEach((currentBotName) => {
            if(this.bots[botList][currentBotName]){
              this.bots[botList][currentBotName][methodToCall](callback);
            } else {
              console.log('Error: could not find ' + currentBotName);
            }
          });
          //TODO: refactor this so that it can tell if they provided a botName that wasn't found
          // Promise.all(botName.forEach((currentBotName) => {
          //   return new Promise((resolve, reject) => {
          //     if(this.bots[botList][botName]){
          //       this.bots[botList][botName].initialize();
          //       resolve();
          //     } else {
          //       reject(currentBotName + ' not found.');
          //     }
          //   });
          // }))
          // .then((data) => {
          //   if(callback instanceof Function){
          //     callback(data);
          //   } else {
          //     throw new Error('Callback not a function');
          //   }
          // })
          // .catch((err) => {
          //   throw new Error(err);
          // });
        } else if (typeof botName === 'string'){ //if they provided just a single bot to start
          if(this.bots[botList][botName]){
            this.bots[botList][botName][methodToCall](callback);
          }
        } else {
          throw new Error('Invalid botName type');
        }
      } else { //if they didn't provide a list to delete the bot from
        if (botName instanceof Array){ //if they provided a list of bots to start
          botName.forEach((currentBotName) => {
            this.bots.botLists.forEach((currentBotList) => {
              if(currentBotList[currentBotName]){
                currentBotList[currentBotName][methodToCall](callback);
              }
            });
          });
        } else if (typeof botName === 'string'){ //if they provided just a single bot to start
          this.bots.botLists.forEach((currentBotList) => {
            if(this.bots[currentBotList][botName]){
              this.bots[currentBotList][botName][methodToCall](callback);
            }
          });
        } else {
          throw new Error('Invalid botName type');
        }
      }
    } catch (err){
      console.log('Error occured while starting bots:', err);
    }
  };

  //this starts a given bot or an array of bots running
  TwitterBot.prototype.startBot = function(botName, callback, botList){
    // console.log('TwitterBot.prototype.startBot called');
    this.callMethodOnBot(botName, 'initialize', callback, botList);
  };


  //this stops a given bot or an array of bots from running
  TwitterBot.prototype.stopBot = function(botName, callback, botList){
    // console.log('TwitterBot.prototype.stopBot called');
    this.callMethodOnBot(botName, 'stop', callback, botList);
  };



  //TODO: finish this function, meant to allow users to get a bot by name so that they can modify it if they want.
  //TODO: it's probably ok to just force them to specify the botList too, especially at MVP level
  // TwitterBot.prototype.getBot = function(botName, botList){
  //   try {
  //     if(botList && this.bots[botList]){ //if they provided the list the bot is in
  //       if(botName instanceof Array){
  //         return botName.map((currentBotName) => {
  //           if (this.bots[botList][currentBotName]){
  //             return this.bots[botList][currentBotName];
  //           } else {
  //             throw new Error(currentBotName + ' not found.');
  //           }
  //         });
  //       } else if (typeof botName === 'string'){
  //         if (this.bots[botList][botName]){
  //           return this.bots[botList][botName];
  //         } else {
  //           throw new Error(botName + ' not found.');
  //         }
  //       } else {
  //         throw new Error('Invalid botName type');
  //       }
  //     } else { //if they just provided the botName
  //       if(botName instanceof Array){
  //         return botName.map((currentBotName) => {
  //
  //           for(var i = 0; i < this.bots.botLists.length; i++){
  //
  //           }
  //
  //
  //         })
  //       } else if (typeof botName === 'string') {
  //
  //         let returnArray = [];
  //         for(var i = 0; i < this.bots.botLists.length; i++){
  //           if(this.bots.botLists[i][botName]){
  //             returnArray.push(this.bots.botLists[i][botName]);
  //           }
  //         }
  //         return returnArray;
  //
  //       } else {
  //         throw new Error('Invalid botName type');
  //       }
  //
  //
  //     }
  //
  //   } catch (err){
  //     console.log('Error occured:', err);
  //     return err;
  //   }
  // };
  
  
  
  
  // //TODO: This is the function that will run to restart the stream
  // //Need to make sure that this will work to update the parameters that it is searching based on
  // TwitterBot.prototype._restartStream = function (newTrackOptions){
  //   this._searchStream.stop();
  //   this._searchStream.reqOpts = newTrackOptions;
  //   this._searchStream.start();
  // };

  
};
