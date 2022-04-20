const express = require("express");
const router = express.Router();
const PouchDB = require("pouchdb");

// Database
const auth = Buffer.from("admin: .PAQWQ6o1Jo").toString("base64"); // TODO: Hide this; this is terrible
const db = new PouchDB("http://localhost:5984/lema", {
	headers: {
		Authorization: "Basic " + auth
	}
});

// bcrypt (for encrypting/decrypting passwords)
const bcrypt = require("bcrypt");
const saltRounds = 10; // Number of rounds to salt (recommended by bcrypt author)

/* Retrieve user by username and (salt-hashed) password */
router.get("/:username/:password", function(req, res, next)
{
	const username = req.params.username;
	const password = req.params.password;

	db.get("user_" + username).then(function(doc)
	{
		// Compare password
		bcrypt.compare(password, doc.password, function(err, result)
		{
			// Passwords match
			if(result)
			{
				const user = {
					username: doc._id,
					displayName: doc.displayName,
					deck: doc.deck
				};
				res.send({type: "success", message: "User found.", user: user});
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
router.put("/:username/:displayName/:password/:email", function(req, res, next)
{
	// New user data
	const username = req.params.username;
	const displayName = req.params.displayName;
	const password = req.params.password;
	const email = req.params.email;

	// Server-side validation
	let errorCollector = "";
	if(username.length < 3)
		errorCollector += "Username too short (min. 3 characters).\n";
	if(username.length > 32)
		errorCollector += "Username too long (max. 32 characters).\n";
	if(displayName.length < 3)
		errorCollector += "Display name too short (min. 3 characters).\n";
	if(displayName.length > 32)
		errorCollector += "Display name too long (max. 32 characters).\n";
	if(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))
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
							"deck": [
								// Can be changed by user at the beginning of each match (and perhaps later in a separate "Choose Deck" view); is all stored in and retrieved from database
								{type: "positive", value: 1},{type: "positive", value: 1},{type: "positive", value: 2},
								{type: "negative", value: -2},{type: "positive", value: 3},{type: "positive", value: 3},
								{type: "negative", value: -4},{type: "positive", value: 4},{type: "positive", value: 5},
								{type: "negative", value: -6}
							],
							"wins": 0,
							"losses": 0,
							"plays": 0,
							"win_streak": 0,
							"lose_streak": 0,
							"longest_win_streak": 0,
							"longest_lose_streak": 0
						};
						db.put(doc).then(function()
						{
							res.send({type: "success", message: "User created."});
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

/* Update user play stats */
router.put("/:username/winner", function(req, res, next)
{
	const username = req.params.username;
	const winner = (req.params.winner === true || req.params.winner === "true");

	db.get("user_" + username).then(function(doc)
	{
		let {wins, losses, plays, win_streak, lose_streak, longest_win_streak, longest_lose_streak} = doc; // Get current values
		if(winner)
		{
			// Update win values
			wins += 1; win_streak += 1;
			longest_win_streak = Math.max(win_streak, longest_win_streak)
			lose_streak = 0;
		}
		else
		{
			// Update loss values
			losses += 1; lose_streak += 1;
			longest_lose_streak = Math.max(lose_streak, longest_lose_streak);
			win_streak = 0;
		}
		plays += 1;

		// Put the document back
		return db.put(({
			...doc,
			wins: wins,
			losses: losses,
			plays: plays,
			win_streak: win_streak,
			lose_streak: lose_streak,
			longest_win_streak: longest_win_streak,
			longest_lose_streak: longest_lose_streak
		}));
	}).then(function(response)
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

module.exports = router;
