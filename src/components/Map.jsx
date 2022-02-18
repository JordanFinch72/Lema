import React, {useEffect, useState} from "react";
import * as d3 from "d3";
import {useD3} from "../hooks/useD3";
import languageCountries from "../supportedLanguages.json";
import countries_data from "../data/countries/countries.json";
import {AddEditNodeModal} from "./AddEditNodeModal";
import {ContextMenu} from "./ContextMenu";

export function Map(props)
{
	// Prop functions
	const openContextMenu = props.openContextMenu.bind(this);
	const addNode = props.addNode.bind(this);
	const editNode = props.editNode.bind(this);
	const removeNode = props.removeNode.bind(this);
	const moveLabel = props.moveLabel.bind(this);
	const openModal = props.openModal.bind(this);

	const collections = props.collections;
	let topojson = require("topojson");
	let countries_data = require("../data/countries/countries.json");

	/* Example of using d3-geo in useEffect() instead of custom useD3() */
	// Note: Unfortunately, cannot append React components (then again, that's probably a good thing...)
	useEffect(() => {
		let svg = d3.selectAll(".map-container").selectAll("svg");
		let countries = countries_data.features;

		// Create path (passed as svg attribute later to draw the countries)
		// TODO: Have it auto-scale as window is dragged
		const width = svg._groups[0][0].clientWidth;
		const height = svg._groups[0][0].clientHeight;
		const projection = d3.geoConicConformal()
			.center([8, 52.823]) // Middle of Europe(ish)
			.scale(1360)
			.translate([width/2, height/2]);
		const path = d3.geoPath().projection(projection);

		// Draw countries, bind data and handlers
		let countryPaths = svg.append("g")
			.selectAll("path") // svg->g->path
			.data(countries)         // svg->g->path
			.enter()                 // svg->g->path (create new nodes per data)
			.append("path")          // svg->g->path (create new nodes per data)
			.attr("fill", (d) => determineFillColour(d))
			.on("click", function(e, d){
				// TODO: Functions (dragging nodes; etc.)
			})
			.on("contextmenu", function(e, d){
				e.preventDefault(); // Prevent browser context menu from opening
				const nodeObject = findNode(d, "cognate");

				if(nodeObject)
				{
					const contextMenuItems = [
						{
							text: "Add new node (journey)", handler: (e) => {
								// Add new journey node within the country/region they right-clicked on (there may be multiple nodes in one country/region for journeys)
								let collectionList = collections.filter(collection => collection.type === "journey"); // Journeys only
								openModal(e, <AddEditNodeModal onNodeSubmit={addNode} collectionList={collectionList} language={d.properties.languages} />);
							}
						},
						{
							text: "Add sibling node (cognate)", handler: (e) => {
								openModal(e, <AddEditNodeModal onNodeSubmit={addNode} collectionIndex={nodeObject.collectionIndex} language={d.properties.languages} />);
							}
						},
						{
							text: "Edit node (cognate)", handler: (e) => {
								openModal(e, <AddEditNodeModal onNodeSubmit={editNode} collectionIndex={nodeObject.collectionIndex} childNodeIndex={nodeObject.childNodeIndex}
								                               word={nodeObject.node.word} language={nodeObject.node.language} />);
							}
						},
						{
							text: "Remove node (cognate)", handler: (e) => {
								removeNode(e, nodeObject.collectionIndex, nodeObject.childNodeIndex);
							}
						}
					];
					openContextMenu(e, <ContextMenu x={e.clientX} y={e.clientY} items={contextMenuItems} />);
				}
				else
				{
					// TODO: Context menu for adding to new collection, adding to existing collection
					const contextMenuItems = [
						{
							text: "Add new node (journey)", handler: (e) => {
								let collectionList = collections.filter(collection => collection.type === "journey"); // Journeys only
								openModal(e, <AddEditNodeModal onNodeSubmit={addNode} collectionList={collectionList} language={d.properties.languages} />);
							}
						},
						{
							text: "Add to collection (cognate)", handler: (e) => {
								let collectionList = collections.filter(collection => collection.type === "cognate"); // Cognates only
								openModal(e, <AddEditNodeModal onNodeSubmit={addNode} collectionList={collectionList} language={d.properties.languages} />);
							}
						}
					]
					openContextMenu(e, <ContextMenu x={e.clientX} y={e.clientY} items={contextMenuItems} />);
				}

			})
			.on("mouseover", function(e, d){
				let element = d3.select(this);
				if(element.attr("fill") === "white") // White can't become transparent
					element.attr("fill", "rgb(230,230,230)")
				else
					element.attr("fill-opacity", "0.65");
			})
			.on("mouseout", function(e, d){
				let element = d3.select(this);
				if(element.attr("fill") === "rgb(230,230,230)") // Reset white
					element.attr("fill", "white")
				else
					element.attr("fill-opacity", "1");
			})
			.attr("stroke", "black")
			.attr("stroke-linejoin", "round")
			.attr("d", path);

		// Cognate labels
		const labelG = svg.append("g");
		const labels = labelG.classed("labels", true);
		countryPaths.each(function(f, i) {
			// Only place labels of countries with associated cognate data
			// TODO: Make this a setting
			let nodeObject = findNode(f, "cognate");
			if(nodeObject)
			{
				let node = nodeObject.node;
				let boundingBox = d3.select(this).node().getBBox(); // Get rectangular bounds of country/region
				let fontSize = node.label.fontSize;                       // Font size of the label
				let text = node.language;                           // Language by default
				if(node.label.type === "country") text = f.properties.name_long;
				else if(node.label.type === "customText") text = node.label.customText;

				// TODO: Initial scale factor depending on size of country (to stop oversized text from escaping country)
				if(text.length !== 0 && !node.fontSize) // Only scale if font size hasn't been set by user
				{
					if(boundingBox.width < (text.length * 16))
						fontSize = boundingBox.width/8 + "px";
				}

				// Append labels to paths, with co-ordinates according to feature's position on map
				let x = (node.label.x === null) ? (boundingBox.x + boundingBox.width/4) : node.label.x;
				let y = (node.label.y === null) ? (boundingBox.y + boundingBox.height/2) : node.label.y;
				let label = labelG.append("text")
					.attr("x", x).attr("y", y)
					.attr("fill", node.label.fontColour)
					.style("font-size", fontSize)
					.text(text);

				// Dragging/resizing handlers
				let startXOffset, startYOffset, resizing = false, startX, startY, startSize, newSize;
				label
					.on("mousemove", (e) => {
						let labelX = parseFloat(label.attr("x")), labelY = parseFloat(label.attr("y"));
						let mouseX = e.layerX, mouseY = e.layerY;

						// Determine corner of text's box
						const southEastCorner = {
							xStart: labelX + label.node().getBBox().width - 5,
							xEnd: labelX + label.node().getBBox().width + 15,
							yStart: labelY,
							yEnd: labelY + 10
						}

						// Check corner
						if(mouseX >= southEastCorner.xStart && mouseX <= southEastCorner.xEnd
							&& mouseY >= southEastCorner.yStart && mouseY <= southEastCorner.yEnd)
						{
							label.style("cursor", "se-resize");
						}
						else
							label.style("cursor", "grab");
					})
					.call(d3.drag()
						.on("start", (e) => {
							let labelX = parseFloat(label.attr("x")), labelY = parseFloat(label.attr("y"));
							let mouseX = e.x, mouseY = e.y;
							startXOffset = mouseX - labelX;
							startYOffset = mouseY - labelY;

							// Determine corner of text's box
							const southEastCorner = {
								xStart: labelX + label.node().getBBox().width - 5,
								xEnd: labelX + label.node().getBBox().width + 15,
								yStart: labelY,
								yEnd: labelY + 10
							}

							// Check corner
							if(mouseX >= southEastCorner.xStart && mouseX <= southEastCorner.xEnd
								&& mouseY >= southEastCorner.yStart && mouseY <= southEastCorner.yEnd)
							{
								resizing = true;
								startX = mouseX;
								startY = mouseY;
								startSize = parseFloat(label.style("font-size"));
							}
						})
						.on("drag", (e) => {
							let mouseX = e.x, mouseY = e.y;
							if(resizing)
							{
								// Resize the label
								if(mouseX >= startX && mouseY >= startY || mouseX <= startX && mouseY <= startY)
								{
									let deltaX = mouseX - startX;
									newSize = startSize + (deltaX / 10);
									if(newSize < 5) newSize = 5; // Floor of 5px to prevent it shrinking into nothingness
									label.style("font-size", newSize + "px"); // Only visually, not updating state itself
								}
							}
							else
							{
								// Move the label
								x = mouseX - startXOffset;
								y = mouseY - startYOffset;
								label.attr("x", x).attr("y", y); // Only visually
							}
						})
						.on("end", () => {
							resizing = false;
							moveLabel(nodeObject.collectionIndex, nodeObject.childNodeIndex, x, y, newSize); // Set final properties
						})
				);
			}
		});

		// Graticules (lines on the map)
		const g = svg.append("g");
		const graticules = g.classed("graticules", true)
			.append("path")
			.attr("fill", "none")
			.attr("stroke", "rgba(0,0,0,.2)")
			.attr("d", path(d3.geoGraticule()()));

		/*
		svg.call(d3.zoom().on("zoom", function () {
			z = d3.event.transform.k;
			draw(); // TODO: Contain above render code into draw() function
		}));
		 */

		// Clean-up function (kills all SVG elements upon unmounting)
		return function cleanup()
		{
			svg.selectAll("g").remove();
		}

	});

	function findNode(d, type)
	{
		// Search collections
		for(let c = 0; c < collections.length; ++c)
		{
			let collection = collections[c];

			if(type === "cognate")
			{
				if(collection.type === "cognate")
				{
					for(let n = 0; n < collection.childNodes.length; ++n)
					{
						let childNode = collection.childNodes[n];

						if(d.properties.languages.includes(childNode.language))
						{
							return {node: childNode, collectionIndex: c, childNodeIndex: n};
						}
					}
				}
			}
		}
	}

	/**
	 * Determines country SVG fill colour according to countries' language(s) and the specified colour of that language's cognate node(s)
	 * @param d Data attached to DOM element via D3 (i.e. the country)
	 * @returns {string} The fill colour, as specified by user in Collection.jsx
	 */
	function determineFillColour(d)
	{
		const nodeObject = findNode(d, "cognate"); // Find node in collections
		if(nodeObject) return nodeObject.node.colour;   // Country has associated collection node? Return the colour
		else return "white";                            // Otherwise, return white by default for all countries with no associated data
	}


	return (
		<div className={"map-container"}>
			<svg
				/*ref={ref}*/
				style={{
					height: "100%",
					width: "100%",
					margin: 0,
					backgroundColor: "#3d73ab" /* The sea */
				}}
			/>
		</div>
	);
}
