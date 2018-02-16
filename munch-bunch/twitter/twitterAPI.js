var express = require('express');
var Twitter = require('twitter');

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
          //Text of All Tweets
          //console.log(tweets[index].text);

          //Typically The Restaurant
          //console.log(tweets[index].entities.user_mentions[0].screen_name);

          //Picture Attached
          //console.log(tweets[index].entities.media[0].media_url_https);

          console.log(tweets[index].entities);
      }
    } else {
      console.error('An error occurred!'); //error handling
    }

  });
}

function getPictures() {
  var params = {
    screen_name: "_kennytnguyen"
  }
}

console.log(getTweets());
