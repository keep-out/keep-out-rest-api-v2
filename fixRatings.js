var express = require('express');
var Twitter = require('twitter');
var base64Img = require('base64-img');
var routes = require('../routes/index');
var queries = require('../queries');


/** SET UP CREDENTIALS **/
var apiKey = '7xY6QFVhWVu06g0cCmjsGyh3pVd8DcIZBjVRZoJGlp6KQGTPbBBKe2tRQKUt9_fbj2kVyMT5-K-3exSVakqc5SdCJ_Uvjgw8lA4EIu6C3KKUkzERa4B5XkBB1S2fWnYx';

const yelp = require('../node_modules/yelp-fusion');
const yelp_client = yelp.client(apiKey);


var router = express.Router();
var client = new Twitter({
  consumer_key: 'B1vBU6xSkzSHdIXNSdmTykril',
  consumer_secret: 'oOTtJR1FFdbBExnIcW5T2Oy11jKhttd5qWcGLCcLNgNHqfGoD4',
  access_token_key: '942160242783092736-LiNNPfaKLlWKU7yNS39HtCt2RIEEqxT',
  access_token_secret: 'd6Hqv7OiPkFcH7ja3fyr6GQbFFgNmya74K8M2SvNMFBfK'
});

var db = queries.getDB();
/** END SET UP CREDENTIALS **/
