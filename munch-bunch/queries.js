t promise = require('bluebird');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

var options = {
	// Initialization options
	promiseLib: promise
};

var pgp = require('pg-promise')(options);
const cn = {
	host: 'munchbunch-db-dev.cguknh9wbkgb.us-west-1.rds.amazonaws.com',
	port: 5432,
	database: 'munchbunch_db_dev',
	user: 'munchbunch',
	password: 'munchbunch'
};
const db = pgp(cn);

// Authenticate user and create JWT
function authenticate(req, res, next) {
	db.one('SELECT hash FROM users WHERE username=$1', 
		req.body.username)
	.then(function (data) {
		// Check hashed password with password
		console.log(req.body.password);
		console.log(data.hash);
		bcrypt.compare(req.body.password, data.hash, 
			function (err, result) {
			// Passwords match
			if (result) {
				// Creates a new JWT that expires in 24 hours
				var token = jwt.sign({username: req.body.username},
					process.env.JWT_SECRET, {expiresIn: 86400});
				res.status(200).json({
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
		return next(err);
	});
}

// Register a new user and create JWT
function register(req, res, next) {
	bcrypt.hash(req.body.hash, 10, function (err, hash) {
		req.body.hash = hash;
	});
	// Write user to database
	db.none('INSERT INTO users(username, hash, fname,' + 
		'lname, email) VALUES (${username}, ${hash},' + 
		'${fname}, ${lname}, ${email})', req.body)
	.then(function () {
		// Creates a new JWT that expires in 24 hours
		var token = jwt.sign({username: req.body.username}, 
			process.env.JWT_SECRET, {expiresIn: 86400});
		res.status(201).json({
			code: "201",
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
}

// Logout, invalidate JWT if not expired
function logout(req, res, next) {
	
}

// Get all trucks from database
function getAllTrucks(req, res, next) {
	db.any('SELECT * FROM trucks').then(function (data) {
		res.status(200).json({
			code: "200",
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
	var truckID = parseInt(req.params.id);
	db.one('SELECT * FROM trucks WHERE id=$1', truckID)
	.then(function (data) {
		res.status(200).json({
			code: "200",
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
	req.body.latitude = parseFloat(req.body.latitude);
	req.body.longitude = parseFloat(req.body.longitude);
	db.none('INSERT INTO trucks(name, phone, latitude,' + 
		'longitude, broadcasting) VALUES (${name}, ${phone},' + 
		'${latitude}, ${longitude}, ${broadcasting})',
		req.body)
	.then(function () {
		res.status(201).json({
			code: "201",
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
	db.none('UPDATE trucks SET name=$1, phone=$2, latitude=$3,' + 
		'longitude=$4, broadcasting=$5 WHERE id=$6',
		[req.body.name, req.body.phone, parseFloat(req.body.latitude),
		parseFloat(req.body.longitude), req.body.broadcasting, 
		parseInt(req.params.id)])
	.then(function () {
		res.status(200).json({
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
	db.result('DELETE FROM trucks WHERE id=$1', truckID)
	.then(function (result) {
		res.status(200).json({
			code: "200",
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
			code: "200",
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
	db.one('SELECT * FROM users WHERE id=$1', userID)
	.then(function (data) {
		res.status(200).json({
			code: "200",
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
	// hash password and save to hash param in request body
	bcrypt.hash(req.body.hash, 10, function (err, hash) {
		req.body.hash = hash;
	});

	db.none('INSERT INTO users(username, hash, fname,' + 
		'lname, email) VALUES (${username}, ${hash},' + 
		'${fname}, ${lname}, ${email})', req.body)
	.then(function () {
		res.status(201).json({
			code: "201",
			status: 'success',
			message: 'Created new user.'
		});
	})
	.catch(function (err) {
		return next(err);
	});
}

// Updates a user by id
function updateUser(req, res, next) {
	db.none('UPDATE users SET username=$1, hash=$2, fname=$3,' + 
		'lname=$4, email=$5 WHERE id=$6', [req.body.username,
		req.body.hash, req.body.fname, req.body.lname,
		req.body.email, parseInt(req.params.id)])
	.then(function () {
		res.status(200).json({
			code: "200",
			status: 'success',
			message: 'Updated user.'
		});
	})
	.catch(function (err) {
		return next(err);
	});
}

// Deletes a user by id
function deleteUser(req, res, next) {
	var userID = parseInt(req.params.id);
	db.result('DELETE FROM users WHERE id=$1', userID)
	.then(function (result) {
		res.status(200).json({
			code: "200",
			status: 'success',
			message: `Removed ${result.rowCount} user.`
		});
	})
	.catch(function (err) {
		return next(err);
	});
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
	deleteUser: deleteUser
};
