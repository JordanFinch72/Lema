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
	const openModal = props.openModal.bind(this);

	const collections = props.collections;
	console.log("[== MAP RENDER ==]");

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
			.scale(1650)
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
								openModal(e, <AddEditNodeModal onNodeSubmit={addNode} collectionList={collectionList} node={nodeObject.node} language={d.properties.languages} />);
							}
						},
						{
							text: "Add sibling node (cognate)", handler: (e) => {
								openModal(e, <AddEditNodeModal onNodeSubmit={addNode} collectionIndex={nodeObject.collectionIndex} node={nodeObject.node} language={d.properties.languages} />);
							}
						},
						{
							text: "Edit node (cognate)", handler: (e) => {
								openModal(e, <AddEditNodeModal onNodeSubmit={editNode} collectionIndex={nodeObject.collectionIndex} wordIndex={nodeObject.wordIndex}
								                               node={nodeObject.node} language={nodeObject.node.language} />);
							}
						},
						{
							text: "Remove node (cognate)", handler: (e) => {
								removeNode(e, nodeObject.collectionIndex, nodeObject.wordIndex);
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
		const vertexEdgesG = svg.append("g").classed("vertex-edges", true); // SVG group for edges
		const verticesLabelsG = svg.append("g").classed("vertices-labels", true); // SVG group for vertices AND cognate labels
		countryPaths.each(function(f, i) {
			let cognateNodeObject = findNodes(f, "cognate");  // The first node in any cognate collection that belongs to this country/region
			let journeyNodeObjects = findNodes(f, "journey"); // All nodes across all journey collections belonging to this country/region
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
				let label = verticesLabelsG.append("text")
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
								newSize = node.label.fontSize;
								label.attr("x", x).attr("y", y); // Only visually
							}
						})
						.on("end", () => {
							resizing = false;
							node.label.x = x; node.label.y = y; node.label.fontSize = newSize;
							editNode(null, cognateNodeObject.collectionIndex, node);
						})
				);
			}
			if(journeyNodeObjects)
			{
				/* Journey visualisations */

				// Loop through all journey nodes inside this country/region
				let xOffset = 0, yOffset = 0, prevDiameter = 0;
				let startEdgeXOffset = 0, startEdgeYOffset = 0, endEdgeXOffset = 0, endEdgeYOffset = 0; // Centre by default
				for(let i = 0; i < journeyNodeObjects.length; ++i)
				{
					let journeyNodeObject = journeyNodeObjects[i];
					let node = journeyNodeObject.node;
					let nextNodeObject = findNextNode(journeyNodeObject.collectionIndex, journeyNodeObject.wordIndex);
					let nextNode = (nextNodeObject) ? nextNodeObject.node : null;
					let boundingBox = d3.select(this).node().getBBox(); // Get rectangular bounds of country/region
					let radius = node.vertex.radius || 50;              // Inherit radius (determined later if null)
					let fontSize = node.vertex.fontSize;
					let vertexText = node.word;                     // Word by default
					if(node.vertex.type === "country") vertexText = f.properties.name_long;
					else if(node.vertex.type === "customText") vertexText = node.vertex.customText;
					else if(node.vertex.type === "language") vertexText = node.language;

					// Initial co-ordinates
					// TODO: Vertex xOffset, yOffset attributes in country/region data
					let vertexX = (node.vertex.x === null) ? (boundingBox.x + boundingBox.width/2) : node.vertex.x;
					let vertexY = (node.vertex.y === null) ? (boundingBox.y + boundingBox.height/2) : node.vertex.y;

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

					// Set initial vertex position // TODO: Do it for label, too
					if(!node.vertex.x || !node.vertex.y)
					{
						node.vertex.x = vertexX; node.vertex.y = vertexY;
						return editNode(null, journeyNodeObject.collectionIndex, node);
					}

					// Prepare text element. This is required to calculate circle radius based on text element's width
					let vertexG = verticesLabelsG.append("g"); // Group required to have circle and text together
					let preparedText = vertexG.append("text")
						.attr("x", vertexX).attr("y", vertexY)
						.attr("fill", node.vertex.fontColour)
						.attr("text-anchor", "middle")        // Centre of circle
						.attr("alignment-baseline", "middle") // Centre of circle
						.style("font-size", "16px")
						.text(vertexText);

					// Determine initial radius of circle
					// TODO: Initial scale factor depending on size of country (to stop oversized text from escaping country)
					let innerTextWidth = preparedText.node().getBBox().width;
					if(vertexText.length !== 0 && !node.vertex.radius) // Only scale if font size hasn't been set by user
					{
						radius = boundingBox.width/8;
						if(radius < innerTextWidth) radius = innerTextWidth/2 + 5; // Convert text "diameter" to radius, add padding
					}
					preparedText.remove(); // Remove prepared text element. It will not show if appended before the circle

					// Place edge between this node and its parents
					let markerSelectString = ""; // String to select markers so they can move whilst being resized
					if(node.parents)
					{
						// Create edge for each parent, originating from this node
						for(let i = 0; i < node.parents.length; ++i)
						{
							let parentNode = node.parents[i];

							// Fingerprint references for marker IDs and data-start/data-end attributes
							const parentRef = journeyNodeObject.collectionIndex + "|" + parentNode.arrayIndex;
							const nodeRef = journeyNodeObject.collectionIndex + "|" + node.arrayIndex;

							// Compute arrowheads
							if(node.vertex.edgeArrowheadEnabled)
							{
								vertexEdgesG.append("defs")
									.append("marker")
									.attr("id", "arrow" + parentRef + nodeRef)
									.attr("markerWidth", 5).attr("markerHeight", 4)
									.attr("refX", radius/2 + 5).attr("refY", 2)
									.attr("orient", "auto")
									.append("polygon")
									.attr("points", "0 0, 5 2, 0 4")
									.attr("fill", node.vertex.edgeArrowheadFillColour)
									.attr("stroke", node.vertex.edgeArrowheadStrokeColour)
									.attr("id", nodeRef);
								markerSelectString += "marker[id=\"arrow"+parentRef+nodeRef+"\"], ";
							}

							// Determine edge start position
							if(node.vertex.edgeStart === "top") startEdgeYOffset = -(radius);
							else if(node.vertex.edgeStart === "right") startEdgeXOffset = radius;
							else if(node.vertex.edgeStart === "bottom") startEdgeYOffset = radius;
							else if(node.vertex.edgeStart === "left") startEdgeXOffset = -(radius);
							else if(node.vertex.edgeStart === "centre") {
								startEdgeXOffset = 0; startEdgeYOffset = 0;
							}

							// Determine edge end position
							if(node.vertex.edgeEnd === "top") endEdgeYOffset = -(radius);
							else if(node.vertex.edgeEnd === "right") endEdgeXOffset = radius;
							else if(node.vertex.edgeEnd === "bottom") endEdgeYOffset = radius;
							else if(node.vertex.edgeEnd === "left") endEdgeXOffset = -(radius);
							else if(node.vertex.edgeStart === "centre") {
								endEdgeXOffset = 0; endEdgeYOffset = 0;
							}

							// Place edge
							const edge = vertexEdgesG.append("line")
								.attr("x1", parentNode.vertex.x + startEdgeXOffset)
								.attr("y1", parentNode.vertex.y + startEdgeYOffset)
								.attr("x2", node.vertex.x + endEdgeXOffset)
								.attr("y2", node.vertex.y + endEdgeYOffset)
								.attr("stroke", node.vertex.edgeStrokeColour)
								.attr("stroke-width", node.vertex.edgeStrokeWidth)
								.attr("data-start", parentRef) // For finding attached edges later
								.attr("data-end", nodeRef);

							if(node.vertex.edgeArrowheadEnabled)
								edge.attr("marker-end", "url(#arrow"+parentRef+nodeRef+")");
						}
					}

					let vertex = vertexG.append("circle")
						.attr("cx", vertexX).attr("cy", vertexY)
						.attr("r", radius + "px")
						.attr("stroke", node.vertex.strokeColour)
						.attr("fill", node.vertex.fillColour);
					let text = vertexG.append("text")
						.attr("x", vertexX).attr("y", vertexY)
						.attr("fill", node.vertex.fontColour)
						.attr("text-anchor", "middle")        // Centre of circle
						.attr("alignment-baseline", "middle") // Centre of circle
						.style("font-size", fontSize)
						.text(vertexText);
					prevDiameter = radius*2;

					// Dragging/resizing handlers
					let startXOffset, startYOffset, resizing = false, startX, startY, startRadius, newVertexRadius, newLabelSize;
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
						};

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
							startX = vertexX;
							startY = vertexY;
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
								startRadius = parseFloat(vertex.attr("r"));
							}
						})
						.on("drag", (e) => {
							let mouseX = e.x, mouseY = e.y;
							if(resizing)
							{
								if(mouseX >= startX && mouseY >= startY || mouseX <= startX && mouseY <= startY)
								{
									// Resize the vertex
									let deltaX = mouseX - startX;
									newVertexRadius = startRadius + (deltaX / 10);
									if(newVertexRadius < 10) newVertexRadius = 10; // Floor of 10px to prevent it shrinking into nothingness
									vertex.attr("r", newVertexRadius + "px"); // Only visually, not updating state itself

									// Resize the vertex's text
									const paddingOffset = 10;
									newLabelSize = ((((newVertexRadius*2) - paddingOffset) / innerTextWidth) * 100) + "%";
									text.style("font-size", newLabelSize);

									// Move arrowheads as it is resized
									if(markerSelectString)
									{
										let selectString = markerSelectString.slice(0, markerSelectString.length-2); // Trim ", " at the end of string
										d3.selectAll(selectString).attr("refX", newVertexRadius/2+5);
									}
								}
							}
							else
							{
								// Move the vertex
								vertexX = mouseX - startXOffset;
								vertexY = mouseY - startYOffset;
								vertex.attr("cx", vertexX).attr("cy", vertexY); // Only visually
								text.attr("x", vertexX).attr("y", vertexY); // Only visually

								// Move the edges
								let dataEnd = journeyNodeObject.collectionIndex + "|" + journeyNodeObject.node.arrayIndex;
								let attachedEdges = d3.selectAll("line[data-start=\""+dataEnd+"\"]"); // Find all edges that start on this node
								let attachedEdges2 = d3.selectAll("line[data-end=\""+dataEnd+"\"]");  // Find all edges that end on this node
								if(attachedEdges)
								{
									attachedEdges.attr("x1", vertexX + startEdgeXOffset)
												 .attr("y1", vertexY + startEdgeYOffset);
								}
								if(attachedEdges2)
								{
									attachedEdges2.attr("x2", vertexX + startEdgeXOffset)
												  .attr("y2", vertexY + startEdgeYOffset);
								}
							}
						})
						.on("end", () => {
							resizing = false;
							node.vertex.x = vertexX; node.vertex.y = vertexY; node.vertex.radius = newVertexRadius || node.vertex.radius; node.vertex.fontSize = newLabelSize || node.vertex.fontSize;
							editNode(null, journeyNodeObject.collectionIndex, node);
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

	/**
	 * Finds all nodes in all collections of specified type where the node's language is within the feature's language array
	 * @param {*} d The dataset feature (country/region) currently being rendered
	 * @param {string} type The type of collection to search for ("journey" or "cognate")
	 */
	function findNodes(d, type)
	{
		// Search collections
		if(type === "cognate")
		{
			for(let c = 0; c < collections.length; ++c)
			{
				let collection = collections[c];
				if(collection.type === "cognate")
				{
					for(let n = 0; n < collection.words.length; ++n)
					{
						let childNode = collection.words[n];

						if(d.properties.languages.includes(childNode.language))
						{
							return {node: childNode, collectionIndex: c, wordIndex: n}; // TODO: Currently only returns first cognate
						}
					}
				}
			}
		}
		else if(type === "journey")
		{
			let countryNodes = [];
			for(let c = 0; c < collections.length; ++c) // Search for all nodes in all collections for this country/region
			{
				let collection = collections[c];
				if(collection.type === "journey")
				{
					for(let n = 0; n < collection.words.length; ++n)
					{
						let childNode = collection.words[n];

						if(d.properties.languages.includes(childNode.language))
							countryNodes.push({node: childNode, collectionIndex: c});
					}
				}
			}
			return countryNodes;
		}
	}
	function findNextNode(collectionIndex, childIndex)
	{
		let nextNode;
		if(collections[collectionIndex].words[childIndex+1])
			return {node: collections[collectionIndex].words[childIndex+1], collectionIndex: collectionIndex, wordIndex: childIndex+1}
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
		if(nodeObject) return nodeObject.node.colour;    // Country has associated collection node? Return the colour
		else return "white";                             // Otherwise, return white by default for all countries with no associated data
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
