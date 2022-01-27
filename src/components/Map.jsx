import React, {useEffect, useState} from "react";
import * as d3 from "d3";
import {useD3} from "../hooks/useD3";
import languageCountries from "../supportedLanguages.json";
import countries_data from "../data/countries/countries.json";

export function Map(props)
{
	const items = props.items;
	let topojson = require("topojson");
	let countries_data = require("../data/countries/countries.json");
	const SUPPORTED_LANGUAGES_ONLY = false; // Will only show countries that contain a "languages" property if set to true

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
		svg.append("g")
			.selectAll("path") // svg->g->path
			.data(countries)         // svg->g->path
			.enter()                 // svg->g->path (create new nodes per data)
			.append("path")          // svg->g->path (create new nodes per data)
			.attr("fill", (d) => determineFillColour(d))
			.on("click", function(e, d){
				// TODO: Functions (context menu for right-click; dragging nodes; etc.)
				alert("Hello, " + d.properties.name + "! You speak " + d.properties.languages + "!");
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

		// TODO: Clean-up function
		return function cleanup()
		{
			svg.selectAll("g").remove();
		}

	});

	/**
	 *
	 * @param d Data attached to DOM element via D3
	 * @returns {string} The fill colour, as chosen by user
	 */
	function determineFillColour(d)
	{
		// TODO: Determine fill colour by node colour data
		//  - Find node language, get corresponding country, if this d's name is country then change to node colour
		let countryLanguages = d.properties.languages || [];
		let fillColour = "";

		for(let collection in items)
		{
			if(items.hasOwnProperty(collection))
			{
				collection = items[collection];
				if(collection.type === "cognate") // Only search for cognates, as journeys aren't filled with colour (at the moment)
				{
					for(let childNode in collection.childNodes)
					{
						if(collection.childNodes.hasOwnProperty(childNode))
						{
							childNode = collection.childNodes[childNode];
							for(let i = 0; i < countryLanguages.length; ++i)
							{
								if(countryLanguages.includes(childNode.language))
								{
									fillColour = childNode.colour;
									break;
								}
							}
						}
						if(fillColour !== "")
							break;
					}
				}
			}
			if(fillColour !== "")
				break;
		}
		return (fillColour === "") ? "white" : fillColour;
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
