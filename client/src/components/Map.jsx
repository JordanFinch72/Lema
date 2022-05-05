import React, {useEffect} from "react";
import * as d3 from "d3";
import {AddEditNodeModal} from "./modals/AddEditNodeModal";
import {ContextMenu} from "./controls/ContextMenu";
import countriesData from "../data/countries/countries.json";
import languageProperties from "../data/languageProperties.json";

export function Map(props)
{
	// DEBUG MODE
	const DEBUG_MODE = true;

	if(DEBUG_MODE)
		console.debug("[== MAP RENDER ==]");

	// Prop functions
	const openContextMenu = props.openContextMenu.bind(this);
	const addNode = props.addNode.bind(this);
	const editNode = props.editNode.bind(this);
	const removeNode = props.removeNode.bind(this);
	const openModal = props.openModal.bind(this);
	const createToast = props.createToast.bind(this);

	// Props
	const collections = props.collections;

	// Note: Unfortunately, cannot append React components (then again, that's probably a good thing...)
	useEffect(() => {
		const svg = d3.selectAll(".map-container").selectAll("svg");
		const countries = countriesData.features;

		// Create path (passed as svg attribute later to draw the countries)
		// TODO: Have it auto-scale as window is dragged/re-sized
		const width = svg._groups[0][0].clientWidth;
		const height = svg._groups[0][0].clientHeight;
		const projection = d3.geoConicConformal()
			.center([8, 52.823]) // Middle of Europe(ish)
			.scale(1650)
			.translate([width/2, height/2]);
		const path = d3.geoPath().projection(projection);

		let coordGroup;
		if(DEBUG_MODE)
		{
			coordGroup = svg.append("g")
				.classed("coords", true)
				.attr('transform', 'translate(50,150)')
		}


		// Draw countries, bind data and handlers
		const countryPaths = svg.append("g")
			.selectAll("path") // svg->g->path
			.data(countries)         // svg->g->path
			.enter()                 // svg->g->path (create new nodes per data)
			.append("path")          // svg->g->path (create new nodes per data)
			.attr("fill", (d) => determineFillColour(d))
			.attr("stroke", (d) => determineStrokeColour(d))
			.attr("stroke-linejoin", "round")
			.attr("d", path)
			.on("click", function(e, d){
				// TODO: Possibly same functions as context menu (see about calling this.onContextMenu() to keep things nice and DRY)
				createToast(e, d.properties.name_long, 2000);
			})
			.on("mousemove", function(e, d)
			{
				if(DEBUG_MODE)
				{
					const x = e.offsetX - 612, y = e.offsetY - 528;
					coordGroup.selectAll("text").remove();
					coordGroup.append("text")
						.text(`(${x},${y})`)
						.attr("fill", "white");
				}
			})
			.on("contextmenu", function(e, d){
				e.preventDefault(); // Prevent browser context menu from opening
				const nodeObject = findNodes(d, "cognate");
				let contextMenuItems = [];

				// If clicked-on country has attached cognate
				if(nodeObject)
				{
					contextMenuItems = [
						{
							text: "Edit node (cognate)", handler: (e) => {
								const collectionList = collections.filter((collection, i) => {
									if(collection.type === "cognate")
									{
										collection.collectionIndex = i;
										return true;
									}
								})

								openModal(e, <AddEditNodeModal onNodeSubmit={editNode} node={nodeObject.node} collectionList={collectionList}
								                               collectionIndex={nodeObject.collectionIndex}
								                               type={"cognate"} language={nodeObject.node.language} />);
							}
						},
						{
							text: "Remove node (cognate)", handler: (e) => {
								removeNode(e, nodeObject.collectionIndex, nodeObject.arrayIndex);
							}
						}
					];
				}
				else
				{
					// TODO: Context menu for adding to new collection, adding to existing collection
					contextMenuItems = [
						{
							text: "Add country to collection (cognate)", handler: (e) => {
								const collectionList = collections.filter((collection, i) => {
									if(collection.type === "cognate")
									{
										collection.collectionIndex = i;
										return true;
									}
								})

								if(collectionList.length <= 0)
								{
									createToast(e, "You must first create a cognate collection for the node to be added to.");
								}
								else
								{
									const node = {word: "", language: "", parents: []};
									node.fillColour = "#FF0000"; node.strokeColour = "#000000";
									node.label = {type: "word", customText: "", fontColour: "#000000", fontSize: null, x: null, y: null};
									openModal(e, <AddEditNodeModal isNewWord={true} onNodeSubmit={addNode} node={node} type={"cognate"} collectionList={collectionList} collectionIndex={collectionList[0].collectionIndex} language={d.properties.languages} />);
								}
							}
						}
					]
				}

				// Common to both
				contextMenuItems.unshift(
					{
						text: "Add new node (journey)", handler: (e) => {
							const collectionList = collections.filter((collection, i) => {
								if(collection.type === "journey")
								{
									collection.collectionIndex = i;
									return true;
								}
							})
							if(collectionList.length <= 0)
							{
								createToast(e, "You must first create a journey collection for the node to be added to.");
							}
							else
							{
								// Open the AddEditNodeModal with initial node data
								const node = {word: "", language: d.properties.languages[0], parents: []};
								node.vertex = {type: "word", customText: "", fontColour: "#000000", strokeColour: "#000000", fillColour: "#FFFFFF", radius: null, fontSize: null, x: null, y: null, edgeStart: "centre", edgeEnd: "centre", edgeStrokeColour: "#000000", edgeStrokeWidth: "2px", edgeArrowheadEnabled: true, edgeArrowheadStrokeColour: "#000000", edgeArrowheadFillColour: "#000000"};
								openModal(e, <AddEditNodeModal isNewWord={true} node={node} type={"journey"} onNodeSubmit={addNode} collectionList={collectionList} collectionIndex={collectionList[0].collectionIndex} language={d.properties.languages} />);
							}
						}
					},
				);
				openContextMenu(e, <ContextMenu x={e.clientX} y={e.clientY} items={contextMenuItems} />);
			})
			.on("mouseover", function(e, d){
				const element = d3.select(this);
				if(element.attr("fill") === "white") // White can't become transparent
					element.attr("fill", "rgb(230,230,230)")
				else
					element.attr("fill-opacity", "0.65");
			})
			.on("mouseout", function(e, d){
				const element = d3.select(this);
				if(element.attr("fill") === "rgb(230,230,230)") // Reset white
					element.attr("fill", "white")
				else
					element.attr("fill-opacity", "1");
			});

		// Cognate labels, journey vertices
		const vertexEdgesG = svg.append("g").classed("vertex-edges", true); // SVG group for edges
		const verticesLabelsG = svg.append("g").classed("vertices-labels", true); // SVG group for vertices AND cognate labels
		countryPaths.each(function(f, i) {
			const cognateNodeObject = findNodes(f, "cognate");  // The first node in any cognate collection that belongs to this country/region
			if(cognateNodeObject)
			{
				/* Cognate visualisations */
				const node = cognateNodeObject.node;
				const boundingBox = d3.select(this).node().getBBox(); // Get rectangular bounds of country/region
				let fontSize = node.label.fontSize;                 // Font size of the label
				let labelText = node.word;                          // Word by default
				if(node.label.type === "Country/region") labelText = f.properties.name_long;
				else if(node.label.type === "Custom text") labelText = node.label.customText;
				else if(node.label.type === "Language") labelText = node.language;

				// Initial scale factor depending on size of country (to stop oversized text from escaping country)
				if(labelText.length !== 0 && !node.label.fontSize) // Only scale if font size hasn't been set by user
				{
					if(boundingBox.width < (labelText.length * 16))
						fontSize = boundingBox.width/8 + "px";
				}

				// Append labels to paths, with co-ordinates according to feature's position on map
				let x = (node.label.x === null) ? (boundingBox.x + boundingBox.width/4) : node.label.x;
				let y = (node.label.y === null) ? (boundingBox.y + boundingBox.height/2) : node.label.y;
				const label = verticesLabelsG.append("text")
					.attr("x", x).attr("y", y)
					.attr("fill", node.label.fontColour)
					.attr("font-family", "'Segoe UI', sans-serif")
					.style("font-size", fontSize)
					.text(labelText);

				// Dragging/resizing handlers
				let startXOffset, startYOffset, resizing = false, startX, startY, startSize, newSize;
				label
					.on("mousemove", (e) => {
						const labelX = parseFloat(label.attr("x")), labelY = parseFloat(label.attr("y"));
						const mouseX = e.layerX, mouseY = e.layerY;

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
							const labelX = parseFloat(label.attr("x")), labelY = parseFloat(label.attr("y"));
							const mouseX = e.x, mouseY = e.y;
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
							const mouseX = e.x, mouseY = e.y;
							if(resizing)
							{
								// Resize the label
								if(mouseX >= startX && mouseY >= startY || mouseX <= startX && mouseY <= startY)
								{
									const deltaX = mouseX - startX;
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
		});

		// Journeys
		const journeyNodeObjects = findNodes(null, "journey");
		if(journeyNodeObjects)
		{
			/* Journey visualisations */

			// Loop through all journey nodes inside this country/region
			let startEdgeXOffset = 0, startEdgeYOffset = 0, endEdgeXOffset = 0, endEdgeYOffset = 0; // Centre by default
			for(let i = 0; i < journeyNodeObjects.length; ++i)
			{
				const journeyNodeObject = journeyNodeObjects[i];
				const node = journeyNodeObject.node;
				const languageProp = getLanguageProp(node);
				let radius = node.vertex.radius || languageProp.radius || 50; // Inherit radius (determined later if null)
				const fontSize = node.vertex.fontSize;
				let vertexText = node.word;  // Word by default
				if(node.vertex.type === "Custom text") vertexText = node.vertex.customText;
				else if(node.vertex.type === "Language") vertexText = node.language;

				/* Build node elements - VERTEX */

				// Initial co-ordinates
				let vertexX = (node.vertex.x === null) ? (languageProp.x + 612) : node.vertex.x;
				let vertexY = (node.vertex.y === null) ? (languageProp.y + 528) : node.vertex.y;

				// Set initial vertex position
				if(!node.vertex.x || !node.vertex.y)
				{
					node.vertex.x = vertexX; node.vertex.y = vertexY;
					return editNode(null, journeyNodeObject.collectionIndex, node); // Performance TODO: Make this a bulk update instead to prevent re-rendering loop
				}

				// Prepare text element. This is required to calculate circle radius based on text element's width
				const vertexG = verticesLabelsG.append("g"); // Group required to have circle and text together
				const preparedText = vertexG.append("text")
					.attr("x", vertexX).attr("y", vertexY)
					.attr("fill", node.vertex.fontColour)
					.attr("text-anchor", "middle")        // Centre of circle
					.attr("alignment-baseline", "middle") // Centre of circle
					.attr("font-family", "'Segoe UI', sans-serif")
					.style("font-size", "16px")
					.text(vertexText);

				// Determine initial radius of circle
				const innerTextWidth = preparedText.node().getBBox().width;
				if(vertexText.length !== 0 && !node.vertex.radius) // Only scale if font size hasn't been set by user
				{
					if(radius < innerTextWidth) radius = innerTextWidth/2 + 5; // Convert text "diameter" to radius, add padding
				}
				preparedText.remove(); // Remove prepared text element. It will not show if appended before the circle

				/* Build node elements - EDGE */

				// Place edge between this node and its parents
				let markerSelectString = ""; // String to select markers so that they can move whilst being resized
				if(node.parents)
				{
					// Create edge for each parent, originating from this node
					for(let i = 0; i < node.parents.length; ++i)
					{
						const parentNode = node.parents[i];

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

				// Place node elements
				const vertex = vertexG.append("circle")
					.attr("cx", vertexX).attr("cy", vertexY)
					.attr("r", radius + "px")
					.attr("stroke", node.vertex.strokeColour)
					.attr("fill", node.vertex.fillColour);
				const text = vertexG.append("text")
					.attr("x", vertexX).attr("y", vertexY)
					.attr("fill", node.vertex.fontColour)
					.attr("text-anchor", "middle")        // Centre of circle
					.attr("alignment-baseline", "middle") // Centre of circle
					.attr("font-family", "'Segoe UI', sans-serif")
					.style("font-size", fontSize)
					.text(vertexText);

				// Dragging/resizing/clicking handlers
				let startXOffset, startYOffset, resizing = false, startX, startY, startRadius, newVertexRadius, newLabelSize;
				const nodeContextMenuHandler = (e) => {
					e.preventDefault();
					const contextMenuItems = [
						{
							text: "Edit node", handler: (e) => {
								const collectionList = collections.filter((collection, i) => {
									if(collection.type === "journey")
									{
										collection.collectionIndex = i;
										return true;
									}
								})

								openModal(e, <AddEditNodeModal onNodeSubmit={editNode} node={node} collectionList={collectionList}
								                               collectionIndex={journeyNodeObject.collectionIndex}
								                               type={"cognate"} language={node.language} />);
							}
						},
						{
							text: "Remove node", handler: (e) => {
								removeNode(e, journeyNodeObject.collectionIndex, node.arrayIndex);
							}
						}
					];
					openContextMenu(e, <ContextMenu x={e.clientX} y={e.clientY} items={contextMenuItems} />);
				};
				const nodeDragHandler = d3.drag()
					.on("start", (e) => {
						const vertexX = parseFloat(vertex.attr("cx")), vertexY = parseFloat(vertex.attr("cy"));
						const mouseX = e.x, mouseY = e.y;
						startX = vertexX;
						startY = vertexY;
						startXOffset = mouseX - vertexX;
						startYOffset = mouseY - vertexY;

						// Dimensions of bottom-right corner
						const squareArea = vertex.node().getBBox().width * vertex.node().getBBox().height;
						const circleArea = Math.PI * Math.pow(parseFloat(vertex.attr("r")),2);
						const cornerWidth = ((squareArea - circleArea) / 4) / 2; // Extract corners, divide by four, width and height are equal length (/2)

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
						const mouseX = e.x, mouseY = e.y;
						if(resizing)
						{
							if(mouseX >= startX && mouseY >= startY || mouseX <= startX && mouseY <= startY)
							{
								// Resize the vertex
								const deltaX = mouseX - startX;
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
									const selectString = markerSelectString.slice(0, markerSelectString.length-2); // Trim ", " at the end of string
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
							const dataEnd = journeyNodeObject.collectionIndex + "|" + journeyNodeObject.node.arrayIndex;
							const attachedEdges = d3.selectAll("line[data-start=\""+dataEnd+"\"]"); // Find all edges that start on this node
							const attachedEdges2 = d3.selectAll("line[data-end=\""+dataEnd+"\"]");  // Find all edges that end on this node
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
					});

				// Assign handlers
				text.on("contextmenu", nodeContextMenuHandler);
				text.call(nodeDragHandler);
				vertex.on("mousemove", (e) => {
					const vertexX = parseFloat(vertex.attr("cx")), vertexY = parseFloat(vertex.attr("cy"));
					const mouseX = e.layerX, mouseY = e.layerY;

					// Dimensions of bottom-right corner
					const squareArea = vertex.node().getBBox().width * vertex.node().getBBox().height;
					const circleArea = Math.PI * Math.pow(parseFloat(vertex.attr("r")),2);
					const cornerWidth = ((squareArea - circleArea) / 4) / 2; // Extract corners, divide by four, width and height are equal length (/2)

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
				.on("contextmenu", nodeContextMenuHandler)
				.call(nodeDragHandler);
			}
		}

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

	function getLanguageProp(node)
	{
		for(const l in languageProperties)
		{
			const languageProp = languageProperties[l];
			if(languageProp.language === node.language)
				return languageProp;
		}
		return {
			"language": node.language,
			"x": 0,
			"y": 0,
			"width": 0,
			"height": 0,
			"radius": 25
		}
	}

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
				const collection = collections[c];
				if(collection.type === "cognate")
				{
					for(let n = 0; n < collection.words.length; ++n)
					{
						const childNode = collection.words[n];

						if(d.properties.languages.includes(childNode.language))
						{
							return {node: childNode, collectionIndex: c, arrayIndex: n}; // TODO: Currently only returns first cognate
						}
					}
				}
			}
		}
		else if(type === "journey")
		{
			const journeyNodeObjects = [];
			for(let c = 0; c < collections.length; ++c) // Search for all nodes in all journey collections
			{
				const collection = collections[c];
				if(collection.type === "journey")
				{
					for(let n = 0; n < collection.words.length; ++n)
					{
						const childNode = collection.words[n];
						journeyNodeObjects.push({node: childNode, collectionIndex: c});
					}
				}
			}
			return journeyNodeObjects;
		}
	}

	/**
	 * Determines country SVG fill colour according to countries' language(s) and the specified colour of that language's cognate node(s).
	 * @param d Data attached to DOM element via D3 (i.e. the country).
	 * @returns {string} The fill colour, as specified by user in Collection.jsx.
	 */
	function determineFillColour(d)
	{
		const nodeObject = findNodes(d, "cognate"); // Find node in collections
		if(nodeObject) return nodeObject.node.fillColour;    // Country has associated collection node? Return the colour
		else return "white";                             // Otherwise, return white by default for all countries with no associated data
	}
	/**
	 * Determines country SVG stroke colour according to countries' language(s) and the specified colour of that language's cognate node(s).
	 * @param d Data attached to DOM element via D3 (i.e. the country).
	 * @returns {string} The fill colour, as specified by user in Collection.jsx.
	 */
	function determineStrokeColour(d)
	{
		const nodeObject = findNodes(d, "cognate");       // Find node in collections
		if(nodeObject) return nodeObject.node.strokeColour;    // Country has associated collection node? Return the colour
		else return "black";                                   // Otherwise, return black by default for all countries with no associated data
	}

	return (
		<div className={"map-container"}>
			<svg
				/*ref={ref}*/
				id={"map-svg"}
				style={{
					height: "100%",
					width: "100%",
					margin: 0
				}}
			>
				<rect width={"100%"} height={"100%"} fill={"#3d73ab"}/>
			</svg>
		</div>
	);
}
