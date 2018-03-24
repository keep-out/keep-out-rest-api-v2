const promise = require('bluebird');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const AWS = require('aws-sdk');

// Define S3 bucket name constants
const TRUCK_PHOTO_BUCKET = 'api.truck-profile-images.munch-bunch';
const TRUCK_SCHEDULE_BUCKET = 'api.truck-schedules.munch-bunch';
const TRUCK_MENU_BUCKET = 'api.truck-menus.munch-bunch';
const USER_PHOTO_BUCKET = 'api.user-profile-images.munch-bunch';
const BASE_64 = 'base64';
const IMG_JPEG = 'image/jpeg';
const APP_JSON = 'application/json';

// Configure AWS with access and secret access keys
AWS.config.update({accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY});
AWS.config.update({region: process.env.AWS_S3_REGION})

var s3 = new AWS.S3();

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

// Returns the DB connection
function getDB() {
	return db;
}

// Prints out all the buckets
// listS3Buckets();
function listS3Buckets() {
	s3.listBuckets(function(err, data) {
		if (err) {
			console.log("Error:", err);
		} else {
			console.log("Buckets:", data.Buckets);
		}
	});
}

// Authenticate user and create JWT
function authenticate(req, res, next) {
	db.one('SELECT user_id, hashed_password FROM users WHERE username=$1',
		req.body.username)
	.then(function (data) {
		// Check hashed password with password
		bcrypt.compare(req.body.password, data.hashed_password,
			function (err, result) {
			// Passwords match
			if (result) {
				// Creates a new JWT that expires in 24 hours
				var token = jwt.sign({username: req.body.username},
					process.env.JWT_SECRET, {expiresIn: 86400});
				res.status(200).json({
					code: 200,
					status: 'success',
					data: {
						auth: true,
						token: token,
						id: data.user_id
					},
					message: 'Authenticated user.'
				});
			// Passwords don't match
			} else {
				console.log('ERROR: passwords don\'t match');
				return next(err);
			}
		});
	})
	.catch(function (err) {
		console.log('ERROR: ' + err);
		// No user exists with given username
		return next(err);
	});
}

// Register a new user and create JWT
function register(req, res, next) {
	console.log(req);
	if (isValidUser(req)) {
		req.body.hashed_password = bcrypt.hashSync(req.body.hashed_password, 10);
		// Write user to database
		db.one('INSERT INTO users(email, username, hashed_password) VALUES' +
			'(${email}, ${username}, ${hashed_password}) RETURNING user_id', req.body)
		.then(function (data) {
			// Creates a new JWT that expires in 24 hours
			var token = jwt.sign({username: req.body.username},
				process.env.JWT_SECRET, {expiresIn: 86400});
			res.status(201).json({
				code: 201,
				status: 'success',
				data: {
					auth: true,
					token: token,
					id: data.user_id
				},
				message: 'Created a new user.'
			});
		})
		.catch(function (err) {
			console.log('ERROR: ' + err);
			return next(err);
		});
	} else {
		console.log('ERROR: invalid request');
		res.status(400).json({
			code: 400,
			status: 'error',
			message: 'Invalid request'
		})
	}
}

// Add bookmark to bookmarks table
function addBookmark(req, res, next) {
	db.one('INSERT INTO bookmarks(user_id, truck_id) VALUES' +
		'(${user_id}, ${truck_id}) RETURNING bookmark_id', req.body)
	.then(function (data) {
		res.status(201).json({
			code: 201,
			status: 'success',
			data: {
				id: data.bookmark_id
			},
			message: 'Added new favorite.'
		});
	})
	.catch(function (err) {
		return next(err);
	});
}

// Remove bookmark from bookmarks table
function deleteBookmark(req, res, next) {
	db.result('DELETE FROM bookmarks WHERE user_id=$1 AND truck_id=$2',
		[req.body.user_id, req.body.truck_id])
		.then(function (result) {
			res.status(200).json({
				code: 200,
				status: 'success',
				message: `Removed ${result.rowCount} bookmark.`
			});
		})
		.catch(function (err) {
			return next(err);
		});
}

// Get all bookmarks from bookmark table for user with user_id
function getAllBookmarks(req, res, next) {
	var userId = parseInt(req.params.id);
	db.any('SELECT truck_id FROM bookmarks WHERE user_id=$1', userId)
	.then(function (data) {
		res.status(200).json({
			code: 200,
			status: 'success',
			data: data,
			message: 'Retrieved bookmarks for user_id: ' + userId + '.'
		});
	})
	.catch(function (err) {
		return next(err);
	});
}

// Get local trucks from database
function getLocalTrucks(req, res, next) {
	// TODO: Add location based query
	db.any('SELECT c.truck_id, c.latitude, c.longitude, c.broadcasting, t.twitter_handle,' +
		't.url, t.name, t.phone, t.rating FROM (SELECT truckevents.truck_id, truckevents.latitude, truckevents.longitude, truckevents.broadcasting FROM truckevents WHERE earth_box(ll_to_earth($1, $2),' +
		'$3) @> ll_to_earth(truckevents.latitude, truckevents.longitude)) AS c INNER JOIN trucks AS t ON c.truck_id=t.truck_id LIMIT 20',
		[req.body.lat, req.body.long, req.body.radius]).then(function (data) {
		res.status(200).json({
			code: 200,
			status: 'success',
			data: data,
			message: 'Retrieved all local trucks.'
		});
	})
	.catch(function (err) {
		console.log(err);
		return next(err);
	});
}

// Get truck names, handles, and phone numbers
function getTruckMainInfo(req, res, next) {
	db.any('SELECT twitter_handle, name, phone FROM trucks').then(function (data) {
		res.status(200).json({
			code: 200,
			status: 'success',
			data: data,
			message: 'Retrieved all main truck data.'
		})
	})
	.catch(function (err) {
		return next(err);
	});
}

// Get all trucks from database
function getAllTrucks(req, res, next) {
	db.any('SELECT * FROM trucks').then(function (data) {
		res.status(200).json({
			code: 200,
			status: 'success',
			data: data,
			message: 'Retrieved all trucks.'
		});
	})
	.catch(function (err) {
		return next(err);
	});
}

// Get truck from database by id
function getTruck(req, res, next) {
	var truckId = parseInt(req.params.id);
	db.one('SELECT * FROM trucks WHERE truck_id=$1', truckId)
	.then(function (data) {
		res.status(200).json({
			code: 200,
			status: 'success',
			data: data,
			message: 'Retrieved truck ' + truckId + '.'
		});
	})
	.catch(function (err) {
		return next(err);
	});
}

// Create a new truck and write to database, returns the truck id
function createTruck(req, res, next) {
	db.one('INSERT INTO trucks(twitter_handle, url, name, phone, address,' +
		'date_open, time_open, time_range, broadcasting)' +
		'VALUES (${twitter_handle}, ${url}, ${name}, ${phone}, ${address},' +
		'${date_open}, ${time_open}, ${time_range}, ${broadcasting}) RETURNING truck_id',
		req.body)
	.then(function (data) {
		res.status(201).json({
			code: 201,
			status: 'success',
			data: data.truck_id,
			message: 'Created new truck.'
		});
	})
	.catch(function (err) {
		return next(err);
	});
}

// Update a truck by id
function updateTruck(req, res, next) {
	db.none('UPDATE trucks SET twitter_handle=$1, url=$2, name=$3,' +
		'phone=$4, address=$5, date_open=$6, time_open=$7,' +
		'time_range=$8, broadcasting=$9 WHERE truck_id=$10',
		[req.body.twitter_handle, req.body.url, req.body.name,
			req.body.phone, req.body.address, req.body.date_open,
			req.body.time_open, req.body.time_range, req.body.broadcasting,
			parseInt(req.params.id)])
	.then(function () {
		res.status(200).json({
			code: 200,
			status: 'success',
			message: 'Updated truck.'
		});
	})
	.catch(function (err) {
		return next(err);
	});
}

// Deletes a truck from the database with id
function deleteTruck(req, res, next) {
	var truckID = parseInt(req.params.id);
	db.result('DELETE FROM trucks WHERE truck_id=$1', truckID)
	.then(function (result) {
		res.status(200).json({
			code: 200,
			status: 'success',
			message: `Removed ${result.rowCount} truck.`
		});
	})
	.catch(function (err) {
		return next(err);
	});
}

// Gets all users from database
function getAllUsers(req, res, next) {
	db.any('SELECT * FROM users')
	.then(function (data) {
		res.status(200).json({
			code: 200,
			status: 'success',
			data: data,
			message: 'Retrieved all users.'
		});
	})
	.catch(function (err) {
		return next(err);
	});
}

// Gets a user by id
function getUser(req, res, next) {
	var userID = parseInt(req.params.id);
	db.one('SELECT * FROM users WHERE user_id=$1', userID)
	.then(function (data) {
		res.status(200).json({
			code: 200,
			status: 'success',
			data: data,
			message: 'Retrieved user ' + userID + '.'
		});
	})
	.catch(function (err) {
		return next(err);
	});
}

// Creates user and writes to database
// (Not used int the client application.
// Refer to /auth/register instead)
function createUser(req, res, next) {
	if (isValidUser(req)) {
		// hash password and save to hash param in request body
		req.body.hashed_password = bcrypt.hashSync(req.body.hashed_password, 10);
		db.one('INSERT INTO users(email, username, hashed_password,' +
			'first_name, last_name) VALUES (${email}, ${username}, ' +
			'${hashed_password}, ${first_name}, ${last_name}' +
			') RETURNING user_id', req.body)
		.then(function (data) {
			res.status(201).json({
				code: 201,
				status: 'success',
				data: data.user_id,
				message: 'Created new user.'
			});
		})
		.catch(function (err) {
			return next(err);
		});
	} else {
		res.status(400).json({
			code: 400,
			status: 'error',
			message: 'Invalid request'
		})
	}
}

// Updates a user by id
function updateUser(req, res, next) {
	if (isValidUser(req)) {
		// Hash the password before updating in the database
		req.body.hashed_password = bcrypt.hashSync(req.body.hashed_password, 10);
		db.none('UPDATE users SET email=$1, username=$2, hashed_password=$3,' +
			'first_name=$4, last_name=$5 WHERE user_id=$6',
			[req.body.email, req.body.username, req.body.hashed_password,
				req.body.first_name, req.body.last_name, parseInt(req.params.id)])
		.then(function () {
			res.status(200).json({
				code: 200,
				status: 'success',
				message: 'Updated user.'
			});
		})
		.catch(function (err) {
			return next(err);
		});
	} else {
		res.status(400).json({
			code: 400,
			status: 'error',
			message: 'Invalid request'
		})
	}
}

// Deletes a user by id
function deleteUser(req, res, next) {
	var userID = parseInt(req.params.id);
	db.result('DELETE FROM users WHERE user_id=$1', userID)
	.then(function (result) {
		res.status(200).json({
			code: 200,
			status: 'success',
			message: `Removed ${result.rowCount} user.`
		});
	})
	.catch(function (err) {
		return next(err);
	});
}

// Helper function to download a file from S3
function downloadFromS3(downloadParams) {
	s3.getObject(downloadParams, function(err, data) {
		if (err) {
			console.log("Error:", err);
			return false;
		} else {
			return true;
		}
	});
}

// Helper function create params for S3 upload
function getParams(bucket, key, base64Data, encoding, type) {
	const params = {
		Bucket: bucket,
		Key: key,
		Body: base64Data,
		ACL: 'public-read',
		ContentEncoding: encoding,
		ContentType: type
	};
	return params;
}

// Get truck photo from S3 by truck_id
function getTruckPhoto(req, res, next) {
	var truckID = req.params.id;
	var	downloadParams = {Bucket: TRUCK_PHOTO_BUCKET,
		Key: truckID};
	var s3Download = s3.getObject(downloadParams).promise();
	s3Download
		.then(function(data) {
			return res.status(200).json({
				code: 200,
				status: 'success',
				data: data.Body.toString(),
				message: 'Downloaded truck photo'
			});
		})
		.catch(function(error) {
			return next(error);
		});
}

// Upload a truck photo to S3 by truck_id
function uploadTruckPhoto(req, res, next) {
	// Allows the upload to finish without timing out
	var truckID = req.params.id;
	var base64Data = req.body.base64Data;
	var uploadParams = getParams(TRUCK_PHOTO_BUCKET,
		truckID, base64Data, BASE_64, IMG_JPEG);
	var s3Upload = s3.upload(uploadParams).promise();
	s3Upload
		.then(function(data) {
			return res.status(201).json({
				code: 201,
				status: 'success',
				message: 'Uploaded truck photo'
			});
		})
		.catch(function(error) {
			return next(error);
		});
}

// Get truck schedule from S3 by truck_id
function getTruckSchedule(req, res, next) {
	// TODO
	var truckID = req.params.id;
	var	downloadParams = {Bucket: TRUCK_SCHEDULE_BUCKET,
		Key: truckID};
	downloadFromS3(downloadParams);
}

// Upload a truck schedule to S3 by truck_id
function uploadTruckSchedule(req, res, next) {
	// TODO
	var truckID = req.params.id;
}

// Get user photo from S3 by user_id
function getUserPhoto(req, res, next) {
	// TODO
	var userID = req.params.id;
	var	downloadParams = {Bucket: USER_PHOTO_BUCKET,
		Key: userID};
	downloadFromS3(downloadParams);
}

// Upload a user photo to S3 by user_id
function uploadUserPhoto(req, res, next) {
	// TODO
	var userID = req.params.id;
	var base64Data = req.body.base64Data;
	var uploadParams = getParams(USER_PHOTO_BUCKET,
		userID, base64Data, BASE_64, IMG_JPEG);
	uploadToS3(uploadParams);
}

// Check if a valid truck
function isValidTruck(req) {
	if (req.body.name.length == 0 ||
		req.body.name.length > 50) {
		return false;
	}
	if (!isValidPhone(req.body.phone)) {
		return false;
	}
	return true;
}

// Check if valid user
function isValidUser(req) {
	if (req.body.username.length < 5 ||
		req.body.username.length > 30) {
		return false;
	}
	if (req.body.hashed_password.length < 5 ||
		req.body.hashed_password.length > 30) {
		return false;
	}
	// if (req.body.first_name.length == 0 ||
	// 	req.body.first_name.length > 30) {
	// 	return false;
	// }
	// if (req.body.last_name.length == 0 ||
	// 	req.body.last_name.length > 30) {
	// 	return false;
	// }
	return isValidEmail(req.body.email);
}

// Check if valid phone number
function isValidPhone(p) {
  var phoneRe = /^[2-9]\d{2}[2-9]\d{2}\d{4}$/;
  var digits = p.replace(/\D/g, "");
  return phoneRe.test(digits);
}

// Check if valid email
function isValidEmail(email) {
	var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// Add query functions
module.exports = {
	getDB: getDB,
	authenticate: authenticate,
	register: register,
	addBookmark: addBookmark,
	deleteBookmark: deleteBookmark,
	getAllBookmarks: getAllBookmarks,
	getLocalTrucks: getLocalTrucks,
	getTruckMainInfo: getTruckMainInfo,
	getAllTrucks: getAllTrucks,
	getTruck: getTruck,
	createTruck: createTruck,
	updateTruck: updateTruck,
	deleteTruck: deleteTruck,
	getAllUsers: getAllUsers,
	getUser: getUser,
	createUser: createUser,
	updateUser: updateUser,
	deleteUser: deleteUser,
	getTruckPhoto: getTruckPhoto,
	uploadTruckPhoto: uploadTruckPhoto,
	getTruckSchedule: getTruckSchedule,
	uploadTruckSchedule: uploadTruckSchedule,
	getUserPhoto: getUserPhoto,
	uploadUserPhoto: uploadUserPhoto,
};
