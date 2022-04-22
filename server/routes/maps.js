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

/* Retrieve all maps and optionally filter maps that have been shared */
router.get("/:sharedOnly", function(req, res, next)
{
	const sharedOnly = req.params.sharedOnly;

	// Retrieve all maps
	db.allDocs({
		include_docs: true,
		startkey: "map_",
		endkey: "map_\ufff0"
	}).then(function(result)
	{
		let rows = result.rows;
		if(sharedOnly) rows = rows.filter((r) => r.shared === true); // Filter only shared maps if required

		res.send({type: "success", message: "Maps retrieved.", maps: rows});
	}).catch(function(error)
	{
		res.send({type: "error", message: "Error: " + error.error});
	});
});

/* Put new map */
router.put("/:username/:data", function(req, res, next)
{
	const username = req.params.username;
	const data = req.params.data;
	let mapID = 1;

	// Determine mapID
	db.allDocs({
		include_docs: false,
		startkey: `map_${username}_`,
		endkey: `map_${username}_\ufff0`
	}).then(function(result)
	{
		mapID = result.rows.length; // e.g. 4 maps; last map ID = 3; new map ID = 4

		const doc = {
			"_id": `map_${username}_${mapID}`,
			"title": data.title,
			"description": data.description,
			"isShared": data.isShared,
			"mapData": data.mapData
		};

		// TODO: Share to Community Showcase
		if(data.isShared)
		{

		}

		db.put(doc).then(function(response)
		{
			if(response.ok)
				res.send({type: "success", message: "Map inserted.", newMapID: mapID});
			else
				res.send({type: "error", message: "Server error.", response: response});
		}).catch(function(error)
		{
			res.send({type: "error", message: "Error:" + error.error});
		});

	}).catch(function(error)
	{
		res.send({type: "error", message: "Error: " + error.error})
	});


});

/* Update map's data */
router.put("/:username/:mapID/:data", function(req, res, next)
{
	const username = req.params.username;
	const mapID = req.params.mapID;
	const data = req.params.data;

	db.get(`map_${username}_${mapID}`).then(function(doc)
	{
		// Put the document back
		return db.put(({
			...doc,
			data: data
		}));
	}).then(function(response)
	{
		if(response.ok)
			res.send({type: "success", message: "Map data updated."});
		else
			res.send({type: "error", message: "Server error.", response: response});
	}).catch(function(error)
	{
		res.send({type: "error", message: "Error:" + error.error});
	});
});

module.exports = router;