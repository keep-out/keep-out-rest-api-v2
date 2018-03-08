var express = require('express');
var Twitter = require('twitter');
var base64Img = require('base64-img');
var routes = require('../routes/index');
//var tweet_parser = require('../node_modules/tweet-parser/index')


/**
**
  SET UP CREDENTIALS
**
**/
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

const promise = require('bluebird');
var options = {
	// Initialization options
	promiseLib: promise
};

var pgp = require('pg-promise')(options);
const cn = {
	host: 'munchbunch-db-dev.cguknh9wbkgb.us-west-1.rds.amazonaws.com',
	port: 5432,
	database: process.env.DB_NAME_DEV,
	user: process.env.DB_USERNAME_DEV,
	password: process.env.DB_PASSWORD_DEV
};
const db = pgp(cn);
/**
**
**
  END SET UP CREDENTIALS
**
**
**/


function getTruckInfo() {
  var params = {
    screen_name: "BookThatTruck",
    count: 5,
    exclude_replies: true,
    include_rts: false
  };

  client.get("statuses/user_timeline", params, function(error, tweets, response) {
    if (!error) {
      for (var index = 0; index < tweets.length; index++) {
          console.log(' ');

          //FULL LENGTH TWEET
          //console.log('Tweet #' + index + ': ' + tweets[index].text);

          var tweet = tweets[index].text;
          console.log('Tweet #' + index + ': ' + tweet);

          var restaurantHandle = null;
          var restaurantHashtag = null;

          if(  tweets[index].text.includes('MON')||tweets[index].text.includes('TUES') ||
               tweets[index].text.includes('WED')||tweets[index].text.includes('THURS') ||
               tweets[index].text.includes('FRI')||tweets[index].text.includes('SAT') ||
               tweets[index].text.includes('SUN')){

              //Restaurant Twitter Handle or Hashtag Mention
              if((tweets[index].entities.hasOwnProperty('user_mentions') && tweets[index].entities.hasOwnProperty('hashtags')) &&
                tweets[index].text.includes('@') && (tweets[index].text.indexOf('@') < tweets[index].text.indexOf('#'))){
                  restaurantHandle = tweets[index].entities.user_mentions[0].screen_name;
                  //console.log('Restaurant Handle: ' + restaurantHandle);
                  getName(restaurantHandle);

              } /*else if (tweets[index].entities.hasOwnProperty('user_mentions') && tweets[index].text.includes('@')) {
                  restaurantHandle = tweets[index].entities.user_mentions[0].screen_name;
                  console.log('Restaurant Handle: ' + restaurantHandle);
              }*/  else if (tweets[index].entities.hasOwnProperty('hashtags') && tweets[index].text.includes('#')) {
                  restaurantHashtag = tweets[index].entities.hashtags[0].text;
                  console.log('Restaurant Hashtag Mention: ' + restaurantHashtag);
              }

              //var loc_time = getLoc_Time(tweet);
              //console.log ('Location & Time below: ');
              //console.log (loc_time);

              if(tweets[index].entities.hasOwnProperty('media')) {
                var restaurantPic = tweets[index].entities.media[0].media_url_https;
                /**
                    ADD Picture Here
                **/
                if (restaurantHandle != null) {

                } else if (restaurantHashtag != null) {

                }
                console.log('Picture File: ' + restaurantPic);
              }
          }

          /*
            *
            * BASE 64 FEATURE
            *
          if(tweets[index].entities.media != null) {
            base64Img.requestBase64(tweets[index].entities.media[0].media_url_https, function(err,res,body) {
              if(!error) {
                //console.log(res);

                //Base64 Image
                //console.log(body);
              } else {
                console.error('An error occurred!'); //error handling
              }
            });
              *
              * BASE 64 FEATURE
              *
            */

            //Restaurant & Tweet Attached Food Picture [.jpg URL] (Populate Media)

          }

          //Text of All Tweets

          //console.log(tweets[index].text);

    } else {
      console.error('An error occurred!'); //error handling
    }

  });
}


function getName(twitterHandle) {
  var params = {
    screen_name: twitterHandle,
    include_entities: false
  };

  var realName;


  client.get("users/lookup", params, function(error, userInfo, response) {
    if (!error) {
      if(userInfo[0].hasOwnProperty('name')){

        //Search for Twitter Handle, then add to restaurant name
        realName = userInfo[0].name;
        /**
        **
          CREATE TRUCK HERE
        **
        **/
        console.log('Restaurant Handle: ' + twitterHandle);
        console.log('Restaurant Name: ' + realName);

        getYelpData(realName);
      } else {
        //return twitterHandle;
      }
    }
      else {
        console.error('An error in GetName occurred!'); //error handling
    }
  });
  //return realName;

}

function getYelpData(restaurantName) {
  yelp_client.search({
    term: restaurantName,
    location: 'los angeles, ca'
    }).then(response => {
      /*
      *
      *
      *
      INSERT phone_number WHERE restaurant name = restaurantName
      *
      *
      *
      */
      var rating = response.jsonBody.businesses[0].rating;
      var phone = response.jsonBody.businesses[0].phone;

      console.log('Restaurant Name: ' + restaurantName);
      console.log('Rating: ' + rating);
      console.log('Phone Number: ' + phone);
      if (response.jsonBody.hasOwnProperty('businesses'))
      {
        /*
        **
          Add into Coords
        **
        */
        var lat = response.jsonBody.businesses[0].coordinates.latitude;
        var long = response.jsonBody.businesses[0].coordinates.longitude;

        console.log('Location Latitude: ' + lat);
        console.log('Location Longitude: ' + long);

      }
    }).catch(e => {
      console.log(e)
    });
}

//getYelpData();

function addTruck(restaurantHandle, restaurantName, res, next) {
  var broadcasting = false;
  db.one('INSERT INTO t.trucks (twitter_handle, name, broadcasting)' +
         'FROM trucks t' +
         'VALUES (${restaurantHandle}, ${restaurantName}), ${broadcasting}')
  .then(function(data) {
    res.status(201).json({
      code: 201,
      success: 'success',
      data: data.truck_id,
      message: 'Added Truck Handle & Name'
    });
  })
  .catch(function (err) {
    return next(err);
  });
}

function addDetails(restaurantName, rating, phone, res, next) {
  db.one('UPDATE trucks' +
         'SET rating = ${rating}, phone = ${phone}' +
         'WHERE restaurantName = ${restaurantName}')
  .then(function(data) {
    res.status(201).json({
      code: 201,
      success: 'success',
      data: data.truck_id,
      message: 'Added Truck Rating & Phone'
    });
  })
  .catch(function (err) {
    return next(err);
  });
}

/*
*
  CHECK THIS
*
*/
function addCoords(restaurantName, lat, long, res, next) {
  db.one('INSERT INTO c (lat, long)' +
         'FROM trucks t, coords c' +
         'VALUES (${lat}, ${long})' +
         'WHERE t.restaurantName = ${restaurantName}, c.truck_id = t.truck_id')
  .then(function(data) {
    res.status(201).json({
      code: 201,
      success: 'success',
      data: data.truck_id,
      message: 'Added Truck Handle & Name'
    });
  })
  .catch(function (err) {
    return next(err);
  });
}

function addPicture(restaurantHandle, url, res, next) {
  db.one('UPDATE trucks' +
         'SET url = ${url}' +
         'WHERE restaurantHandle = ${restaurantHandle}')
  .then(function(data) {
    res.status(201).json({
      code: 201,
      success: 'success',
      data: data.truck_id,
      message: 'Added Truck Picture URL'
    });
  })
  .catch(function (err) {
    return next(err);
  });
}

getTruckInfo();



/*
function getLoc_Time(tweet) {
  var reg = new RegExp(/^\s*(\w*)[\s,\.]+((?:[\s,\.]*[^\s\n]*)*?)[\s,\.]*?((?:[A-Za-z_\.]+?[\s,\.]*?)*)\s+?(\w+?\/\w+|\d+(?:[\s,\.]*?[A-Za-z\.][a-z\.]*?)*)(?:[\s,\.]+[#@A-Za-z]*)*(?:(\d{5})?)[\s,\.]*((?:[\s,\.]*?[A-Za-z]+)*).*?OPEN[\s,\.]*?([0-9]{1,2}):?([0-9:]{2})-([0-9]{1,2}):?([0-9]{2}).*?\s*$/i);
  var matches = tweet.match(reg);
  if (matches == null)
  {
    return null;
  }
  var startinfo = {hour: matches[7],minute: matches[8]};
  var endinfo = {hour: matches[9], minute: matches[10]};
  var stamp = resolveDate(matches[1],startinfo,endinfo);
  if (stamp == null)
  {
    return null;
  }
  var outData = {
    "address": matches[4],
    "zip": matches[5],
    //"addressnotes": matches[3],
    //"tags": matches[2],
    "notes": matches[6], //additional notes about truck location (eg: "behind building")
    //times
    // "open": stamp[0].toString(),
    // "close": stamp[1].toString()
    "open": stamp[0].getTime(),
    "close": stamp[1].getTime()
  };
  return outData;
}

function resolveDate (day,start,end) {
  if ((start.hour == "") || (start.minute == "") || (end.hour == "") || (end.minute == ""))
	{
		return null;
	}

	var startHour = parseInt(start.hour);
	var endHour = parseInt(end.hour);
	//probably fine for now, determines true time
	if (endHour > startHour) //if both same 'AM/PM'
	{
		if (startHour < 6)
		{
			startHour += 12;
			endHour += 12;
		}
	}
	else
	{
		endHour += 12;
	}

	var dayLookup = {"SUN":0,"MON":1,"TUES":2,"WED":3,"THURS":4,"FRI":5,"SAT":6};
	var today = new Date(Date.now());
	var startStamp = new Date();
	var endStamp = new Date();

	//ONLY need to worry about timezones when deciding if truck is open/closed based on its location
	//opening hours are truck-specific so they follow the truck to whatever timezone it's in,
	// but they don't need to be corrected for

	day = day.toUpperCase();
	if (!(day in dayLookup))
	{
		return null;
	}

	today.setHours(6,0); //6am
	startStamp.setHours(startHour,parseInt(start.minute),0,0);
	endStamp.setHours(endHour,parseInt(end.minute),0,0);
	//check from yesterday to avoid time inconsistency worries
	var dayNum = (today.getDay()+6)%7;
	var date = today.getDate()+(dayLookup[day]-today.getDay());
	if (dayLookup[day] < (dayNum))
	{
		date += 7;
	}
	startStamp.setDate(date);
	endStamp.setDate(date);
	return [startStamp, endStamp];
}
*/
