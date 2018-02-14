const promise = require('bluebird');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const aws = require('aws-sdk');

aws.config.loadFromPath('aws.json');
var s3 = new aws.S3();

var options = {
	// Initialization options
	promiseLib: promise
};

var pgp = require('pg-promise')(options);
const cn = {
	host: 'munchbunch-db-dev.cguknh9wbkgb.us-west-1.rds.amazonaws.com',
	port: 5432,
	database: "munchbunch_db_dev",
	user: "munchbunch",
	password: "munchbunch"
};
const db = pgp(cn);

// Authenticate user and create JWT
function authenticate(req, res, next) {
	db.one('SELECT hashed_password FROM users WHERE username=$1',
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
						token: token
					},
					message: 'Authenticated user.'
				});
			// Passwords don't match
			} else {
				return next(err);
			}
		});
	})
	.catch(function (err) {
		// No user exists with given username
		console.log(err);
		return next(err);
	});
}

// Register a new user and create JWT
function register(req, res, next) {
	if (isValidUser(req)) {
		req.body.hashed_password = bcrypt.hashSync(req.body.hashed_password, 10);
		// Write user to database
		db.none('INSERT INTO users(username, hashed_password, first_name,' +
			'last_name, email) VALUES (${username}, ${hashed_password},' +
			'${first_name}, ${last_name}, ${email})', req.body)
		.then(function () {
			// Creates a new JWT that expires in 24 hours
			var token = jwt.sign({username: req.body.username},
				process.env.JWT_SECRET, {expiresIn: 86400});
			res.status(201).json({
				code: 201,
				status: 'success',
				data: {
					auth: true,
					token: token
				},
				message: 'Created a new user.'
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

// TODO: Logout, invalidate JWT if not expired
function logout(req, res, next) {

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
	var truckID = parseInt(req.params.truck_id);
	db.one('SELECT * FROM trucks WHERE truck_id=$1', truckID)
	.then(function (data) {
		res.status(200).json({
			code: 200,
			status: 'success',
			data: data,
			message: 'Retrieved truck ' + truckID + '.'
		});
	})
	.catch(function (err) {
		return next(err);
	});
}

// Create a new truck and write to database
function createTruck(req, res, next) {
	db.none('INSERT INTO trucks(twitter_handle, name, phone, address,' +
		'date_open, time_open, time_range, broadcasting)' +
		'VALUES (${twitter_handle}, ${name}, ${phone}, ${address},' +
		'${date_open}, ${time_open}, ${time_range}, ${broadcasting})',
		req.body)
	.then(function () {
		res.status(201).json({
			code: 201,
			status: 'success',
			message: 'Created new truck.'
		});
	})
	.catch(function (err) {
		return next(err);
	});
}

// Update a truck by id
function updateTruck(req, res, next) {
	db.none('UPDATE trucks SET twitter_handle=$1, name=$2,' +
		'phone=$3, address=$4, date_open=$5, time_open=$6,' +
		'time_range=$7, broadcasting=$8 WHERE truck_id=$9',
		[req.body.twitter_handle, req.body.name, req.body.phone,
			req.body.address, req.body.date_open, req.body.time_open,
			req.body.time_range, req.body.broadcasting,
			parseInt(req.params.truck_id)])
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
	var truckID = parseInt(req.params.truck_id);
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
	var userID = parseInt(req.params.user_id);
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
		bcrypt.hash(req.body.hash, 10, function (err, hashed) {
			req.body.hashed_password = hash;
		});
		db.none('INSERT INTO users(username, hashed_password, first_name,' +
			'last_name, email) VALUES (${username}, ${hashed_password},' +
			'${first_name}, ${last_name}, ${email})', req.body)
		.then(function () {
			res.status(201).json({
				code: 201,
				status: 'success',
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
		db.none('UPDATE users SET username=$1, hashed_password=$2,' +
			'first_name=$3, last_name=$4, email=$5 WHERE user_id=$6',
			[req.body.username, req.body.hashed_password, req.body.first_name,
			req.body.last_name, req.body.email, parseInt(req.params.user_id)])
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
	var userID = parseInt(req.params.user_id);
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

// Get truck photo from S3 by truck_id
function getTruckPhoto(req, res, next) {
	// TODO
	var truckID = parseInt(req.params.truck_id);
}

// Upload a truck photo to S3 by truck_id
function uploadTruckPhoto(req, res, next) {
	// TODO
	var truckID = parseInt(req.params.truck_id);
}

// Get truck schedule from S3 by truck_id
function getTruckSchedule(req, res, next) {
	// TODO
	var truckID = parseInt(req.params.truck_id);
}

// Upload a truck schedule to S3 by truck_id
function uploadTruckSchedule(req, res, next) {
	// TODO
	var truckID = parseInt(req.params.truck_id);
}

// Get user photo from S3 by user_id
function getUserPhoto(req, res, next) {
	// TODO
	var userID = parseInt(req.params.user_id);
}

// Upload a user photo to S3 by user_id
function uploadUserPhoto(req, res, next) {
	// TODO
	var userID = parseInt(req.params.user_id);
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
	if (req.body.first_name.length == 0 ||
		req.body.first_name.length > 30) {
		return false;
	}
	if (req.body.last_name.length == 0 ||
		req.body.last_name.length > 30) {
		return false;
	}
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
	authenticate: authenticate,
	register: register,
	logout: logout,
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
	uploadUserPhoto: uploadUserPhoto
};
