'use strict';
//chai test stuff
let chai        = require('chai');
let expect      = chai.expect;
let TwitterBot  = require(__dirname + '/../lib/twitter-bot.js');
let Twit        = require('twit');
let testKeys    = require(__dirname + '/../config/test-config1.js');
let twit        = new Twit(testKeys);
let twitterBot  = new TwitterBot();
twitterBot.twit = twit;


describe('defineTimerBot.js', ()=>{

  describe('constructor function', ()=>{
    
  });
  
  describe('intialize method', () => {
    
  });
});
