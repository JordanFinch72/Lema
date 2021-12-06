import React, {useState} from "react";
import * as d3 from "d3";
import {useD3} from "../hooks/useD3";
import world from "../world.json";
import languageCountries from "../languageCountries.json";

export function Map(props)
{
	const items = props.items;

	let ref = useD3(
		(svg) =>
		{
			let width = svg._groups[0][0].clientWidth;
			let height = svg._groups[0][0].clientHeight;

			let areas = world.features
				.reduce((countries2, feature) =>
				{
					// flatten multipolygons into polygons
					if(feature.geometry.type === "Polygon")
					{
						countries2.push(feature);
					}
					else
					{ // MultiPolygon
						feature.geometry.coordinates.forEach(coordinates =>
						{
							countries2.push({
								type: "Feature",
								properties: feature.properties,
								geometry: {type: "Polygon", coordinates}
							});
						});
					}
					return countries2;
				}, []);

			// TODO: Adjust dimensions so it displays better; have it auto-scale as window is dragged
			const W = width;
			const H = W * height / width;
			const g = svg.append("g");
			const g_countries = g.append("g");

			const graticules = g.append("path")
				.attr("fill", "none")
				.attr("stroke", "rgba(0,0,0,.2)");

			let x = 0;
			let z = 1.7;

			function draw()
			{
				const projection = d3.geoConicConformal()
					.parallels([40, 68])
					.rotate([-10 + x / z / 15, 0])
					.center([8 - 10, 53.823])
					.scale(900 * z)
					.translate([W / 2, H / 2]);

				const path = d3.geoPath().projection(projection);
				const countries = g_countries.selectAll("path").data(areas);
				countries.exit().remove();
				console.log(countries);
				countries
					.enter().append("path")
					.attr("fill", function(d){
						// TODO: Determine fill colour by node colour data
						//  - Need a language->country mapping
						//  - Find node language, get corresponding country, if this d's name is country then change to node colour

						let countryName = d.properties.name;
						let fillColour = "white";

						for(let collection in items)
						{
							if(items.hasOwnProperty(collection))
							{
								collection = items[collection];
								if(collection.type === "cognate")
								{
									for(let childNode in collection.childNodes)
									{
										if(collection.childNodes.hasOwnProperty(childNode))
										{
											childNode = collection.childNodes[childNode];
											if(languageCountries[childNode.language] === countryName)
												fillColour = childNode.colour;
										}
									}
								}
							}
						}
						return fillColour;
					})
					.attr("stroke", "black")
					.attr("stroke-linejoin", "round")
					.merge(countries)
					.attr("d", path);

				graticules.attr("d", path(d3.geoGraticule().step([20, 20])()));
			}


			/*
			 svg.call(d3.zoom().on("zoom", function () {
			 z = d3.event.transform.k;
			 draw();
			 }));
			 */

			draw();

			return svg.node();

		},
		[props.mapRenderCounter]
	);

	return (
		<div className={"map-container"}>
			<svg
				ref={ref}
				style={{
					height: "100%",
					width: "100%",
					margin: 0
				}}>
			</svg>
		</div>
	);
}
