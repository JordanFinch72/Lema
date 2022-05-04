const express = require("express");
const router = express.Router();
const PouchDB = require("pouchdb");
const jwt = require("jsonwebtoken");

// Database
const authHeader = Buffer.from("admin" + ":" + ".PAQWQ6o1Jo").toString("base64"); // TODO: Hide this; this is terrible
const db = new PouchDB("http://localhost:5984/lema", {
	headers: {
		Authorization: "Basic " + authHeader
	}
});

// bcrypt (for encrypting/decrypting passwords)
const bcrypt = require("bcrypt");
const saltRounds = 10; // Number of rounds to salt (recommended by bcrypt author)

const JWT_SECRET = "025B972660676EA25D6A501D09CD3B1515272A8A149F8E04DF4CDD9EDEB1359A";
const RT_SEED = "7391C2E1D899974AA86C8A859843024D955DEE13344C8E7D1F45F8FD7BE7C86E";

const generateRefreshToken = () =>
{
	const seed = (RT_SEED + RT_SEED).split("");
	let refreshToken = "";

	// Jumble up seed
	for(let i = 0; i < seed.length; ++i)
	{
		const r = Math.floor(Math.random() * seed.length-1); // Random index
		refreshToken += seed[r];
	}
	return refreshToken;
}

/* Retrieve user by username and (salt-hashed) password */
router.get("/:username/:password", function(req, res, next)
{
	const username = req.params.username;
	const password = req.params.password;
	let jwtToken = "", refreshToken = "";

	db.get("user_" + username).then(function(doc)
	{
		// Compare password
		bcrypt.compare(password, doc.password, function(err, result)
		{
			// Passwords match
			if(result)
			{
				const user = {
					username: username,
					displayName: doc.displayName
				};

				// TODO: If token is invalid because it's expired, send that message back to client (which will then refresh the token)
				jwt.sign(user, JWT_SECRET, {
					algorithm: "HS256",
					expiresIn: 900, // 15 minutes
					issuer: "LEMA Authentication"
				}, function(error, token){
					refreshToken = generateRefreshToken();
					jwtToken = token;
					doc = {
						...doc,
						refreshToken: refreshToken
					};
					db.put(doc);
					res.send({type: "success", message: "User found.", tokens: [jwtToken, refreshToken]});
				});
			}
			else
				res.send({type: "error", message: "Password incorrect."});
		});
	}).catch(function(error)
	{
		if(error.error === "not_found")
			res.send({type: "error", message: "Username not found in database."});
	});

});

/* Insert new user */
router.put("/:displayName/:username/:password/:email", function(req, res, next)
{
	// New user data
	const displayName = req.params.displayName;
	const username = req.params.username;
	const password = req.params.password;
	const email = req.params.email;

	// Server-side validation
	let errorCollector = "";
	if(displayName.length < 3)
		errorCollector += "Display name too short (min. 3 characters).\n";
	if(displayName.length > 32)
		errorCollector += "Display name too long (max. 32 characters).\n";
	if(username.length < 3)
		errorCollector += "Username too short (min. 3 characters).\n";
	if(username.length > 32)
		errorCollector += "Username too long (max. 32 characters).\n";
	if(displayName.length < 3)
		errorCollector += "Display name too short (min. 3 characters).\n";
	if(displayName.length > 32)
		errorCollector += "Display name too long (max. 32 characters).\n";
	if(!email.match(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/))
		errorCollector += "E-mail address invalid.\n";
	if(password.length < 6)
		errorCollector += "Password too short (min. 6 characters).\n";

	if(errorCollector.length <= 0)
	{
		db.get("user_" + username).then(function()
		{
			res.send({type: "error", message: "Username taken."});
		}).catch(function(error)
		{
			// Username doesn't already exist; create user
			if(error.error === "not_found")
			{
				// Generate salt
				bcrypt.genSalt(saltRounds, function(err, salt)
				{
					// Salt and hash password
					bcrypt.hash(password, salt, function(err, hash)
					{
						const doc = {
							"_id": "user_" + username,
							"displayName": displayName,
							"password": hash,
							"email": email,
							"refreshToken": ""
						};
						db.put(doc).then(function(response)
						{
							if(response.ok)
								res.send({type: "success", message: "User created."});
							else
								res.send({type: "error", message: "Server error.", response: response});
						}).catch(function(error)
						{
							res.send({type: "error", message: "Error: " + error.error});
						});
					});
				});
			}
		});
	}
	else
		res.send({type: "error", message: errorCollector});


});

/* Update user profile */
router.put("/:username/", function(req, res, next)
{
	const username = req.params.username;
	const data = req.body.data;
	const token = req.body.jwt;

	// Verify JWT
	jwt.verify(token, JWT_SECRET, {}, (error, decodedToken) => {
		if(error)
		{
			console.log(error);
			res.send({type: "error", message: "JWT error.", error: error});
		}
		else if(decodedToken.username === username)
		{
			db.get("user_" + username).then(function(doc)
			{
				doc = {
					...doc,
					displayName: data.displayName
				};

				// Put the document back
				return db.put(doc);
			}).then(function(response)
			{
				if(response.ok)
					res.send({type: "success", message: "User profile updated."});
				else
					res.send({type: "error", message: "Server error.", response: response});
			}).catch(function(error)
			{
				res.send({type: "error", message: "Error: " + error.error});
			});
		}
	});
});

/* Delete user profile */
router.delete("/:username/", function(req, res, next)
{
	const username = req.params.username;
	const token = req.body.jwt;

	jwt.verify(token, JWT_SECRET, {}, (error, decodedToken) => {
		if(error)
		{
			console.log(error);
			res.send({type: "error", message: "JWT error.", error: error});
		}
		else if(decodedToken.username === username)
		{
			// Delete user document
			db.get(`user_${username}`).then(function(doc)
			{
				return db.remove(doc);
			}).then(function(response)
			{
				if(!response.ok)
					res.send({type: "error", message: "Server error.", response: response});
				else
					res.send({type: "success", message: "User profile and maps deleted."});
			}).catch(function(error)
			{
				res.send({type: "error", message: "Error:" + error.error});
			});

			/*// Delete all maps belonging to this user
			db.allDocs({
				include_docs: true,
				startkey: `map_${username}_`,
				endkey: `map_${username}_\ufff0`
			}).then(function(result)
			{
				return db.remove(result);
			}).then(function(response){
				if(response.ok)
					res.send({type: "success", message: "User profile and maps deleted."});
			}).catch(function(error)
			{
				res.send({type: "error", message: "Error: " + error.error});
			});*/
		}
	});


});

module.exports = router;
