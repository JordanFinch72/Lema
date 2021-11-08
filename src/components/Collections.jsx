import {Component} from "react";
import {Journey} from "./Journey";
import {Cognate} from "./Cognate";

export class Collections extends Component
{
	constructor(props)
	{
		super(props);
		this.state = {
			items: [
				{
					// TODO: Dummy data
					type: "journey",
					header: {word: "horse", language: "English (UK)"},
					childNodes: [{word: "kers", language: "Proto-Indo-European"}, {word: "krsos", language: "Proto-Indo-European"},
						{word: "hrussa", language: "Proto-Germanic"}, {word: "hross", language: "Proto-West-Germanic"}, {word: "horse", language: "English"}]
				}
			]
		};
	}

	render()
	{
		let itemElements = [];

		// TODO: Consider whether both cognates AND journeys may be displayed at the same time
		this.state.items.map((item, index) => {
			if(item.type === "cognate")
			{
				itemElements.push(
					<Cognate header={item.header} childNodes={item.childNodes} key={index} />
				);
			}
			else if(item.type === "journey")
			{
				itemElements.push(
					<Journey header={item.header} childNodes={item.childNodes} key={index} />
				);
			}
		});

		return(
			<div>
				{itemElements}
			</div>
		);
	}
}