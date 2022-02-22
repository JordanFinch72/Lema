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
	const moveVertex = props.moveVertex.bind(this);
	const openModal = props.openModal.bind(this);

	const collections = props.collections;
	let topojson = require("topojson");
	let countries_data = require("../data/countries/countries.json");

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
				// TODO: Possibly same functions as context menu (see about calling this.onContextMenu() to keep things nice and DRY)
			})
			.on("contextmenu", function(e, d){
				e.preventDefault(); // Prevent browser context menu from opening
				const nodeObject = findNodes(d, "cognate");

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

		// Cognate labels, journey vertices
		const labelVertexG = svg.append("g");
		const labels = labelVertexG.classed("labels", true);
		countryPaths.each(function(f, i) {
			// Only place labels of countries with associated cognate data
			// TODO: Make this a setting
			let cognateNodeObject = findNodes(f, "cognate");
			let journeyNodeObjects = findNodes(f, "journey");
			if(cognateNodeObject)
			{
				/* Cognate visualisations */
				let node = cognateNodeObject.node;
				let boundingBox = d3.select(this).node().getBBox(); // Get rectangular bounds of country/region
				let fontSize = node.label.fontSize;                 // Font size of the label
				let labelText = node.language;                      // Language by default
				if(node.label.type === "country") labelText = f.properties.name_long;
				else if(node.label.type === "customText") labelText = node.label.customText;
				else if(node.label.type === "word") labelText = node.word;

				// TODO: Initial scale factor depending on size of country (to stop oversized text from escaping country)
				if(labelText.length !== 0 && !node.label.fontSize) // Only scale if font size hasn't been set by user
				{
					if(boundingBox.width < (labelText.length * 16))
						fontSize = boundingBox.width/8 + "px";
				}

				// Append labels to paths, with co-ordinates according to feature's position on map
				let x = (node.label.x === null) ? (boundingBox.x + boundingBox.width/4) : node.label.x;
				let y = (node.label.y === null) ? (boundingBox.y + boundingBox.height/2) : node.label.y;
				let label = labelVertexG.append("text")
					.attr("x", x).attr("y", y)
					.attr("fill", node.label.fontColour)
					.style("font-size", fontSize)
					.text(labelText);

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
							moveLabel(cognateNodeObject.collectionIndex, cognateNodeObject.childNodeIndex, x, y, newSize); // Set final properties
						})
				);
			}
			if(journeyNodeObjects)
			{
				/* Journey visualisations */

				// Loop through all journey nodes inside this country/region
				let xOffset = 0, yOffset = 0, prevDiameter = 0;
				for(let i = 0; i < journeyNodeObjects.length; ++i)
				{
					let journeyNodeObject = journeyNodeObjects[i];
					let node = journeyNodeObject.node;
					let nextNodeObject = findNextNode(journeyNodeObject.collectionIndex, journeyNodeObject.childNodeIndex);
					let nextNode = (nextNodeObject) ? nextNodeObject.node : null;
					let boundingBox = d3.select(this).node().getBBox(); // Get rectangular bounds of country/region
					let radius = node.vertex.radius || 50;              // Inherit radius (determined later if null)
					let vertexText = node.language;                     // Language by default
					if(node.vertex.type === "country") vertexText = f.properties.name_long;
					else if(node.vertex.type === "customText") vertexText = node.vertex.customText;
					else if(node.vertex.type === "word") vertexText = node.word;

					// Initial co-ordinates
					// TODO: Vertex xOffset, yOffset attributes in country/region data
					let vertexX = (node.vertex.x === null) ? (boundingBox.x) : node.vertex.x;
					let vertexY = (node.vertex.y === null) ? (boundingBox.y) : node.vertex.y;

					// If vertex's default position would exit country/regions' bounds, push it down
					if(!node.vertex.x && !node.vertex.y)
					{
						if((vertexX + xOffset*2) > (boundingBox.x + boundingBox.width))
						{
							yOffset += prevDiameter;
							xOffset = 0;
						}
						else // Otherwise, increase the offset by the previous vertex's diameter
						{
							xOffset += prevDiameter;
						}
						vertexY += yOffset;
						vertexX += xOffset;
					}

					// Prepare text element. This is required to calculate circle radius based on text element's width
					let vertexG = labelVertexG.append("g"); // Group required to have circle and text together
					let preparedText = vertexG.append("text")
						.attr("x", vertexX).attr("y", vertexY)
						.attr("fill", node.vertex.strokeColour)
						.attr("text-anchor", "middle")        // Centre of circle
						.attr("alignment-baseline", "middle") // Centre of circle
						.style("font-size", "16px")
						.text(vertexText);

					// Determine initial radius of circle
					// TODO: Initial scale factor depending on size of country (to stop oversized text from escaping country)
					if(vertexText.length !== 0 && !node.vertex.radius) // Only scale if font size hasn't been set by user
					{
						radius = boundingBox.width/8;
						let innerTextWidth = preparedText.node().getBBox().width;
						if(radius < innerTextWidth) radius = innerTextWidth/2 + 5; // Convert text "diameter" to radius, add padding
					}
					preparedText.remove(); // Remove prepared text element. It will not show if appended before the circle

					// Set initial vertex position // TODO: Do it for label, too
					if(!node.vertex.x || !node.vertex.y)
						moveVertex(journeyNodeObject.collectionIndex, journeyNodeObject.childNodeIndex, vertexX, vertexY, radius);

					let vertex = vertexG.append("circle")
						.attr("cx", vertexX).attr("cy", vertexY)
						.attr("r", radius + "px")
						.attr("stroke", node.vertex.strokeColour)
						.attr("fill", node.vertex.fillColour);
					let text = vertexG.append("text")
						.attr("x", vertexX).attr("y", vertexY)
						.attr("fill", node.vertex.strokeColour)
						.attr("text-anchor", "middle")        // Centre of circle
						.attr("alignment-baseline", "middle") // Centre of circle
						.style("font-size", "16px")
						.text(vertexText);
					prevDiameter = radius*2;

					// Place edge between this node and next node
					let edge;
					if(nextNode)
					{
						// TODO: Make this work
						/*
						labelVertexG.append("defs")
							.append("marker")
							.attr("id", "arrow")
							.attr("markerWidth", 5).attr("markerHeight", 4)
							.attr("refX", 0).attr("refY", 2)
							.attr("orient", "auto")
							.append("polygon")
							.attr("points", "0 0, 5 2, 0 4");
						 */

						let startEdgeXOffset = 0, startEdgeYOffset = 0, endEdgeXOffset = 0, endEdgeYOffset = 0;

						// Determine edge start position
						if(node.vertex.edgeStart === "top") startEdgeYOffset = -(node.vertex.radius);
						else if(node.vertex.edgeStart === "right") startEdgeXOffset = node.vertex.radius;
						else if(node.vertex.edgeStart === "bottom") startEdgeYOffset = node.vertex.radius;
						else if(node.vertex.edgeStart === "left") startEdgeXOffset = -(node.vertex.radius);

						// Determine edge end position
						if(node.vertex.edgeEnd === "top") endEdgeYOffset = -(node.vertex.radius);
						else if(node.vertex.edgeEnd === "right") endEdgeXOffset = node.vertex.radius;
						else if(node.vertex.edgeEnd === "bottom") endEdgeYOffset = node.vertex.radius;
						else if(node.vertex.edgeEnd === "left") endEdgeXOffset = -(node.vertex.radius);

						// Place edge
						edge = labelVertexG.append("line")
							.attr("x1", node.vertex.x + startEdgeXOffset)
							.attr("y1", node.vertex.y + startEdgeYOffset)
							.attr("x2", nextNode.vertex.x + endEdgeXOffset)
							.attr("y2", nextNode.vertex.y + endEdgeYOffset)
							.attr("stroke", "black")     // TODO: User choice
							.attr("stroke-width", "2px"); // TODO: User choice
							//.attr("marker-end", "url(#arrow)");
					}

					// Dragging/resizing handlers
					let startXOffset, startYOffset, resizing = false, startX, startY, startSize, newSize;
					vertex.on("mousemove", (e) => {
						let vertexX = parseFloat(vertex.attr("cx")), vertexY = parseFloat(vertex.attr("cy"));
						let mouseX = e.layerX, mouseY = e.layerY;

						// Dimensions of bottom-right corner
						let squareArea = vertex.node().getBBox().width * vertex.node().getBBox().height;
						let circleArea = Math.PI * Math.pow(parseFloat(vertex.attr("r")),2);
						let cornerWidth = ((squareArea - circleArea) / 4) / 2; // Extract corners, divide by four, width and height are equal length (/2)

						// Determine corner of circle's box
						const southEastCorner = {
							xStart: vertexX,
							xEnd: vertexX + cornerWidth,
							yStart: vertexY,
							yEnd: vertexY + cornerWidth
						}

						// Check corner
						if(mouseX >= southEastCorner.xStart && mouseX <= southEastCorner.xEnd
							&& mouseY >= southEastCorner.yStart && mouseY <= southEastCorner.yEnd)
						{
							vertex.style("cursor", "se-resize");
						}
						else
							vertex.style("cursor", "grab");
					})
					.call(d3.drag()
						.on("start", (e) => {
							let vertexX = parseFloat(vertex.attr("cx")), vertexY = parseFloat(vertex.attr("cy"));
							let mouseX = e.x, mouseY = e.y;
							startXOffset = mouseX - vertexX;
							startYOffset = mouseY - vertexY;

							// Dimensions of bottom-right corner
							let squareArea = vertex.node().getBBox().width * vertex.node().getBBox().height;
							let circleArea = Math.PI * Math.pow(parseFloat(vertex.attr("r")),2);
							let cornerWidth = ((squareArea - circleArea) / 4) / 2; // Extract corners, divide by four, width and height are equal length (/2)

							// Determine corner of circle's box
							const southEastCorner = {
								xStart: vertexX,
								xEnd: vertexX + cornerWidth,
								yStart: vertexY,
								yEnd: vertexY + cornerWidth
							}

							// Check corner
							if(mouseX >= southEastCorner.xStart && mouseX <= southEastCorner.xEnd
								&& mouseY >= southEastCorner.yStart && mouseY <= southEastCorner.yEnd)
							{
								resizing = true;
								startX = mouseX;
								startY = mouseY;
								startSize = parseFloat(vertex.attr("r"));
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
									vertex.attr("r", newSize + "px"); // Only visually, not updating state itself
								}
							}
							else
							{
								// Move the label
								vertexX = mouseX - startXOffset;
								vertexY = mouseY - startYOffset;
								vertex.attr("cx", vertexX).attr("cy", vertexY); // Only visually
								text.attr("x", vertexX).attr("y", vertexY); // Only visually
							}
						})
						.on("end", () => {
							resizing = false;
							moveVertex(journeyNodeObject.collectionIndex, journeyNodeObject.childNodeIndex, vertexX, vertexY, newSize); // Set final properties
						})
					);
				}

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

	function findNodes(d, type)
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
			else if(type === "journey")
			{
				let countryNodes = [];
				if(collection.type === "journey")
				{
					for(let n = 0; n < collection.childNodes.length; ++n)
					{
						let childNode = collection.childNodes[n];

						if(d.properties.languages.includes(childNode.language))
							countryNodes.push({node: childNode, collectionIndex: c, childNodeIndex: n});
					}
					return countryNodes;
				}
			}
		}
	}
	function findNextNode(collectionIndex, childIndex)
	{
		let nextNode;
		if(collections[collectionIndex].childNodes[childIndex+1])
			return {node: collections[collectionIndex].childNodes[childIndex+1], collectionIndex: collectionIndex, childNodeIndex: childIndex+1}
		else
			return null;

	}

	/**
	 * Determines country SVG fill colour according to countries' language(s) and the specified colour of that language's cognate node(s)
	 * @param d Data attached to DOM element via D3 (i.e. the country)
	 * @returns {string} The fill colour, as specified by user in Collection.jsx
	 */
	function determineFillColour(d)
	{
		const nodeObject = findNodes(d, "cognate"); // Find node in collections
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
