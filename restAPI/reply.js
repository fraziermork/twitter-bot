'use strict';


let Twit = require('twit');
let fs = require('fs');
let keys = require(__dirname + '/config2.js');
let t = new Twit(keys);


//post data  to fill in
let newStatus = 'W ';
let filePath = '///Users/lisabisa25/Desktop/bern.png';
let retweetID = '715420889878147072';
let replyId = '343360866131001345';



//update status
function textReply () {
  t.post('statuses/update', {status: newStatus}, function(err, data, response){
    console.log(data);
  });
}
textReply();

function textReplyResId () {
  t.post('statuses/update', {status: newStatus, in_reply_to_status_id: replyId}, function(err, data, response){

    console.log(data);
  });
}
textReplyResId();



//post media that is chunked to given response
function mediaReply (){
  var b64content = fs.readFileSync(filePath, {encoding: 'base64'});
  t.post('media/upload', {media_data: b64content}, function(err, data, response){
    var mediaId = data.media_id_string;
    console.log(data.media_id_string);
    var params = {status: newStatus, in_reply_to_status_id: replyId, media_ids: [mediaId]};
    console.log(data);
    t.post('statuses/update', params, function (err, data, response){
      console.log(data);
    });
  });
}
mediaReply();


//post Retweet
// function retweetReply(){
// t.post('statuses/retweet/:id', {id: retweetID}, function(err, data, response){
//   console.log(data);
//     // return data.split('').reverse().join('');
//
//
// });
// }
// retweetReply();


//removeRetweet
// function removeRetweet(){
//   t.post('statuses/destroy/:id', {id: })
// }
