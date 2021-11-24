import {Component} from "react";
import {Journey} from "./Journey";
import {Cognate} from "./Cognate";
import {Button} from "./Button";
import {AddCollectionModal} from "./AddCollectionModal";

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
			],
		};

		this.onNodeColourClick = this.onNodeColourClick.bind(this);
		this.onAddCollectionSubmit = this.onAddCollectionSubmit.bind(this);
		this.onManualAddClick = this.props.onManualAddClick.bind(this);
		this.closeModal = this.props.closeModal.bind(this);
	}

	/**
	 * Open a modal that allows user to change the colour of the node on the map
	 */
	onNodeColourClick(e, node)
	{
		// TODO: Open modal, allow user choice
		let newValue = "red";

		// Find node and set colour
		let newItems = this.state.items;
		for(let i = 0; i < newItems.length; ++i)
		{
			for(let j = 0; j < newItems[i].childNodes.length; ++j)
			{
				let childNode = newItems[i].childNodes[j];
				if(childNode === node)
				{
					newItems[i].childNodes[j].colour = newValue;
				}
			}
		}
		this.setState({items: newItems});
	}

	onAddCollectionSubmit(e, data)
	{
		console.log(data);
		if(data.type === "Cognates") data.type = "cognate";
		else if(data.type === "Historical journey") data.type = "journey";

		this.setState((prevState) => ({
			items: [
				...prevState.items,
				{type: data.type, header: data.header, childNodes:[]}
			]
		}), function(){
			this.closeModal();
			console.log(this.state);
		});


	}

	render()
	{
		// TODO: Consider whether both cognates AND journeys may be displayed at the same time
		let itemElements = this.state.items.map((item, index) => {
			if(item.type === "cognate")
			{
				return <Cognate header={item.header} childNodes={item.childNodes} key={index} />;
			}
			else if(item.type === "journey")
			{
				return <Journey header={item.header} childNodes={item.childNodes} key={index} onNodeColourClick={this.onNodeColourClick} />;
			}
		});

		return(
			<div className={"collections-container"}>
				<div className={"header-container"}>
					<h2>Journeys</h2>
					<Button value={"+"} id={"manual-add"} style={{alignSelf: "end"}} onClick={(e) => {
						this.onManualAddClick(e, <AddCollectionModal onAddCollectionSubmit={this.onAddCollectionSubmit} />);
					}} />
				</div>
				{itemElements}
			</div>
		);
	}
}