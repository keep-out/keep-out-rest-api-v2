\c munchbunch_db_dev;

CREATE TABLE trucks (
	id SERIAL,
	name TEXT NOT NULL,
	phone TEXT,
	latitude REAL,
	longitude REAL,
	broadcasting BOOLEAN NOT NULL,
	CONSTRAINT trucks_pkey PRIMARY KEY (id)
);

CREATE TABLE users (
	id SERIAL,
	username TEXT NOT NULL,
	hash TEXT NOT NULL,
	fname TEXT NOT NULL,
	lname TEXT NOT NULL,
	email TEXT NOT NULL,
	CONSTRAINT users_pkey PRIMARY KEY (id)
);