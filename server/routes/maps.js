const express = require("express");
const router = express.Router();
const PouchDB = require("pouchdb");

// Database
const authHeader = Buffer.from("admin" + ":" + ".PAQWQ6o1Jo").toString("base64"); // TODO: Hide this; this is terrible
const db = new PouchDB("http://localhost:5984/lema", {
	headers: {
		Authorization: "Basic " + authHeader
	}
});

/* Retrieve all maps and optionally filter for maps that have been shared */
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
		const maps = [];
		if(sharedOnly === "1")
			rows = rows.filter((r) => r.doc.isShared === true); // Filter only shared maps if required

		// Strip extraneous data
		for(let i = 0; i < rows.length; ++i)
		{
			const map = rows[i];
			const idParts = map.doc._id.split("_");

			maps.push({
				activeMap: {
					mapID: idParts[2], // The ID
					title: map.doc.title,
					description: map.doc.description,
					isShared: map.doc.isShared,
					owner: idParts[1]
				},
				mapData: map.doc.mapData
			});
		}

		res.send({type: "success", message: "Maps retrieved.", maps: maps});
	}).catch(function(error)
	{
		res.send({type: "error", message: "Error: " + error.error});
	});
});

/* Retrieve all maps belonging to a particular user and optionally filter for maps that have been shared */
router.get("/:username/:sharedOnly", function(req, res, next)
{
	const username = req.params.username;
	const sharedOnly = req.params.sharedOnly;

	// Retrieve all maps
	db.allDocs({
		include_docs: true,
		startkey: `map_${username}_`,
		endkey: `map_${username}_\ufff0`
	}).then(function(result)
	{
		let rows = result.rows;
		const maps = [];
		if(sharedOnly === "1")
			rows = rows.filter((r) => r.doc.isShared === true); // Filter only shared maps if required

		// Strip extraneous data
		for(let i = 0; i < rows.length; ++i)
		{
			const map = rows[i];
			maps.push({
				activeMap: {
					mapID: map.doc._id.split("_")[2], // Just the number
					title: map.doc.title,
					description: map.doc.description,
					isShared: map.doc.isShared,
				},
				mapData: map.doc.mapData
			});
		}

		res.send({type: "success", message: "User's maps retrieved.", maps: maps});
	}).catch(function(error)
	{
		res.send({type: "error", message: "Error: " + error.error});
	});
});

/* Retrieve specific map belonging to a particular user and optionally filter for maps that have been shared */
router.get("/:username/:mapID/:sharedOnly", function(req, res, next)
{
	const username = req.params.username;
	const mapID = req.params.mapID;
	const sharedOnly = req.params.sharedOnly;

	// Retrieve all maps
	db.allDocs({
		include_docs: true,
		startkey: `map_${username}_${mapID}`,
		endkey: `map_${username}_${mapID}\ufff0`
	}).then(function(result)
	{
		const rows = result.rows;
		if(sharedOnly === "1" && !rows[0].doc.isShared)
			res.send({type: "error", message: "Error: This map's owner has not made the map shareable."});
		else
		{
			// Strip extraneous data
			const map = {
				activeMap: {
					mapID: null, // null so that non-owner user doesn't save it to their own profile
					title: rows[0].doc.title,
					description: rows[0].doc.description,
					isShared: rows[0].doc.isShared
				},
				mapData: rows[0].doc.mapData
			};
			res.send({type: "success", message: "User's map retrieved.", map: map});
		}
	}).catch(function(error)
	{
		res.send({type: "error", message: "Error: " + error.error});
	});
});

/* Put new map */
router.put("/:username/", function(req, res, next)
{
	const username = req.params.username;
	const data = req.body.data;
	let mapID = 0;

	// Determine mapID
	db.allDocs({
		include_docs: true,
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

		db.put(doc).then(function(response)
		{
			if(response.ok)
			{
				// TODO: Share to Community Showcase
				/*if(data.isShared)
				 {

				 }*/
				const map = {
					mapID: mapID,
					title: data.title,
					description: data.description,
					isShared: data.isShared
				};
				res.send({type: "success", message: "Map inserted.", activeMap: map});
			}
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
router.put("/:username/:mapID/", function(req, res, next)
{
	const username = req.params.username;
	const mapID = req.params.mapID;
	const data = req.body.data;

	db.get(`map_${username}_${mapID}`).then(function(doc)
	{
		// Put the document back
		return db.put(({
			...doc,
			"title": data.title,
			"description": data.description,
			"isShared": data.isShared,
			"mapData": data.mapData
		}));
	}).then(function(response)
	{
		if(response.ok)
		{
			const map = {
				mapID: mapID,
				title: data.title,
				description: data.description,
				isShared: data.isShared
			};
			res.send({type: "success", message: "Map data updated.", activeMap: map});
		}
		else
			res.send({type: "error", message: "Server error.", response: response});
	}).catch(function(error)
	{
		res.send({type: "error", message: "Error:" + error.error});
	});
});


/* Delete map */
router.delete("/:username/:mapID/", function(req, res, next)
{
	const username = req.params.username;
	const mapID = req.params.mapID;

	db.get(`map_${username}_${mapID}`).then(function(doc)
	{
		// Remove the document
		return db.remove(doc);
	}).then(function(response)
	{
		if(response.ok)
			res.send({type: "success", message: "Map deleted."});
		else
			res.send({type: "error", message: "Server error.", response: response});
	}).catch(function(error)
	{
		res.send({type: "error", message: "Error:" + error.error});
	});
});

module.exports = router;