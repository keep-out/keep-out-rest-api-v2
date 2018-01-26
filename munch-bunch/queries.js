var promise = require('bluebird');

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

// Get all trucks from database
function getAllTrucks(req, res, next) {
	db.any('SELECT * FROM trucks').then(function (data) {
		res.status(200).json({
			status: 'success',
			data: data,
			message: 'Retrieved ALL trucks'
		});
	})
	.catch(function (err) {
		return next(err);
	});
}

// Get truck from database by id
function getTruck(req, res, next) {
	var truckID = parseInt(req.params.id);
	db.one('SELECT * FROM trucks WHERE id = $1', truckID)
	.then(function (data) {
		res.status(200).json({
			status: 'success',
			data: data,
			message: 'Retrieved truck ' + truckID
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
			status: 'success',
			message: 'Created new truck'
		});
	})
	.catch(function (err) {
		return next(err);
	});
}

// Update a truck by id
function updateTruck(req, res, next) {
	db.none('UPDATE trucks SET name=$1, phone=$2, latitude=$3, longitude=$4, broadcasting=$5 WHERE id=$6',
		[req.body.name, req.body.phone, parseFloat(req.body.latitude),
		parseFloat(req.body.longitude), req.body.broadcasting, 
		parseInt(req.params.id)])
	.then(function () {
		res.status(200).json({
			status: 'success',
			message: 'Updated truck'
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
			status: 'success',
			message: `Removed ${result.rowCount} puppy`
		});
	})
	.catch(function (err) {
		return next(err);
	});
}

// add query functions
module.exports = {
	getAllTrucks: getAllTrucks,
	getTruck: getTruck,
	createTruck: createTruck,
	updateTruck: updateTruck,
	deleteTruck: deleteTruck
};