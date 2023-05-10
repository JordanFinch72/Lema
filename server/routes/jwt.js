const express = require("express");
const router = express.Router();
const PouchDB = require("pouchdb");
const jwt = require("jsonwebtoken");

// Database
const authHeader = Buffer.from("lema-heroku" + ":" + ".PAQWQ6o1Jo").toString("base64"); // TODO: Hide this; this is terrible
const db = new PouchDB("wss://teofl5ol9ddtn2ik.apps.cloud.couchbase.com:4984/lema-endpoint", {
	headers: {
		Authorization: "Basic " + authHeader
	}
});

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

/* Refresh and retrieve new tokens */
router.get("/refresh/:username/:refreshToken", function(req, res, next)
{
	const username = req.params.username;
	const refreshToken = req.params.refreshToken;
	let invalidToken = false;
	let jwtToken = null, newRefreshToken = null;

	db.get("user_" + username).then(function(doc)
	{
		const user = {
			username: username,
			displayName: doc.displayName
		};

		// Check for token
		if(doc.refreshToken !== refreshToken)
		{
			// Invalidate JWT and refresh tokens
			doc = {
				...doc,
				refreshToken: newRefreshToken
			}
			invalidToken = true;
		}
		else
		{
			// Regenerate JWT and refresh token
			jwtToken = jwt.sign(user, JWT_SECRET, {
				algorithm: "HS256",
				expiresIn: 900 * 4 * 6, // 6 hours // Major TODO: Change to 15 minutes when releasing to public
				issuer: "LEMA Authentication"
			});
			newRefreshToken = generateRefreshToken();
			doc = {
				...doc,
				refreshToken: newRefreshToken
			}
		}
		return db.put(doc); // Put the document back
	}).then(function(response)
	{
		if(response.ok)
		{
			if(invalidToken)
				res.send({type: "error", message: "Invalid refresh token."}); // Logs user out on client side (intentional security measure)
			else
				res.send({type: "success", message: "Token refreshed.", tokens: [jwtToken, newRefreshToken]});
		}
		else
			res.send({type: "error", message: "Server error.", response: response});
	}).catch(function(error)
	{
		res.send({type: "error", message: "Error: " + error.error});
	});
});

module.exports = router;
