var express = require('express');
var Twitter = require('twitter');
var base64Img = require('base64-img');

var router = express.Router();
var client = new Twitter({
  consumer_key: 'B1vBU6xSkzSHdIXNSdmTykril',
  consumer_secret: 'oOTtJR1FFdbBExnIcW5T2Oy11jKhttd5qWcGLCcLNgNHqfGoD4',
  access_token_key: '942160242783092736-LiNNPfaKLlWKU7yNS39HtCt2RIEEqxT',
  access_token_secret: 'd6Hqv7OiPkFcH7ja3fyr6GQbFFgNmya74K8M2SvNMFBfK'
});



function getTweets() {
  var params = {
    screen_name: "BookThatTruck",
    count: 1
  };

  client.get("statuses/user_timeline", params, function(error, tweets, response) {
    if (!error) {
      for (var index = 0; index < tweets.length; index++) {
          console.log(index);

          //Restaurant
          if(tweets[index].entities.hasOwnProperty('user_mentions') &&
            tweets[index].text.includes('@')){
            console.log('Restaurant Name: ' + tweets[index].entities.user_mentions[0].screen_name);
          } else {
            //console.log('Restaurant Name: ' + tweets[index].entities.hashtags[0].text);
          }

          //Picture Attached in Base 64
          if(tweets[index].entities.media != null) {
            base64Img.requestBase64(tweets[index].entities.media[0].media_url_https, function(err,res,body) {
              if(!error) {
                //console.log(res);
                console.log(body);
              } else {
                console.error('An error occurred!'); //error handling
              }
            });
            //console.log('Picture File: ' + tweets[index].entities.media[0].media_url_https);
          }

          //Text of All Tweets
          console.log(tweets[index].text);




      }
    } else {
      console.error('An error occurred!'); //error handling
    }

  });
}

console.log(getTweets());
