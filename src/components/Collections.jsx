import {Component} from "react";
import {Collection} from "./Collection";
import {Button} from "./Button";
import {AddEditCollectionModal} from "./AddEditCollectionModal";
import {AddEditNodeModal} from "./AddEditNodeModal";

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
					childNodes: [
						{word: "kers", language: "Proto-Indo-European"},
						{word: "krsos", language: "Proto-Indo-European"},
						{word: "hrussa", language: "Proto-Germanic"},
						{word: "hross", language: "Proto-West-Germanic"},
						{word: "horse", language: "English"}
					]
				}
			]
		};

		this.onNodeColourClick = this.onNodeColourClick.bind(this);
		this.onAddCollectionSubmit = this.onAddCollectionSubmit.bind(this);
		this.onEditCollectionSubmit = this.onEditCollectionSubmit.bind(this);
		this.onAddNodeSubmit = this.onAddNodeSubmit.bind(this);
		this.onEditNodeSubmit = this.onEditNodeSubmit.bind(this);
		this.addNodeHandler = this.addNodeHandler.bind(this);
		this.addNodeDefaultHandler = this.addNodeDefaultHandler.bind(this);
		this.openModal = this.props.openModal.bind(this);
		this.closeModal = this.props.closeModal.bind(this);
		this.openContextMenu = this.props.openContextMenu.bind(this);
		this.closeContextMenu = this.props.closeContextMenu.bind(this);
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
		if(data.type === "Cognates") data.type = "cognate";
		else if(data.type === "Historical journey") data.type = "journey";

		// Data validation
		let errorCollector = "";
		if(data.header.word === null || data.header.word.length <= 0)
			errorCollector += "You must enter a word.\n";
		if(data.header.language === null || data.header.language.length <= 0)
			errorCollector += "You must enter a language.\n";

		if(errorCollector.length > 0)
			alert(errorCollector); // TODO: Proper error handling with toast
		else
		{
			this.setState((prevState) => ({
				items: [
					...prevState.items,
					{type: data.type, header: data.header, childNodes: []}
				]
			}), this.closeModal);
		}
	}
	onEditCollectionSubmit(e, data)
	{
		console.log(data);

		if(data.type === "Cognates") data.type = "cognate";
		else if(data.type === "Historical journey") data.type = "journey";

		// Data validation
		let errorCollector = "";
		if(data.header.word === null || data.header.word.length <= 0)
			errorCollector += "You must enter a word.\n";
		if(data.header.language === null || data.header.language.length <= 0)
			errorCollector += "You must enter a language.\n";

		let newItems = this.state.items;
		newItems[data.index].type = data.type;
		newItems[data.index].header = data.header;
		this.setState({items: newItems}, this.closeModal);
	}

	/* Context menu item handlers */
	addNodeHandler(e, parentIndex)
	{
		// Open the AddEditNodeModal
		this.openModal(e, <AddEditNodeModal onNodeSubmit={this.onAddNodeSubmit} parentIndex={parentIndex}/>);
	}
	addNodeDefaultHandler(e, parentIndex)
	{
		this.onAddNodeSubmit(e, {word: "word", language: "language", parentIndex: parentIndex});
	}
	onAddNodeSubmit(e, data)
	{
		// Data validation
		let errorCollector = "";
		if(data.word === null || data.word.length <= 0)
			errorCollector += "You must enter a word.\n";
		if(data.language === null || data.language.length <= 0)
			errorCollector += "You must enter a language.\n";

		if(errorCollector.length > 0)
			alert(errorCollector); // TODO: Proper error handling with toast
		else
		{
			// Create new child node
			let newChildNode = {word: data.word, language: data.language};
			let newItems = this.state.items;
			newItems[data.parentIndex].childNodes.push(newChildNode); // Data contains parent Journey component's index (its location in this.state.items array)

			this.setState({items: newItems}, this.closeModal);
		}
	}
	onEditNodeSubmit(e, data)
	{
		// Data validation
		let errorCollector = "";
		if(data.word === null || data.word.length <= 0)
			errorCollector += "You must enter a word.\n";
		if(data.language === null || data.language.length <= 0)
			errorCollector += "You must enter a language.\n";

		if(errorCollector.length > 0)
			alert(errorCollector); // TODO: Proper error handling with toast
		else
		{
			// Create new child node
			let newChildNode = {word: data.word, language: data.language};
			let newItems = this.state.items;
			newItems[data.parentIndex].childNodes[data.childIndex] = {word: data.word, language: data.language};

			this.setState({items: newItems}, this.closeModal);
		}
	}

	render()
	{
		// TODO: Consider whether both cognates AND journeys may be displayed at the same time
		let journeys = null, cognates = null;
		let journeyElements = [], cognateElements = [];
		this.state.items.map((item, index) =>
		{
			let component = <Collection
				key={index} index={index} type={item.type} header={item.header} openModal={this.openModal}
				childNodes={item.childNodes}
				onNodeColourClick={this.onNodeColourClick} openContextMenu={this.openContextMenu}
				closeContextMenu={this.closeContextMenu} addNodeHandler={this.addNodeHandler}
				onAddNodeSubmit={this.onAddNodeSubmit} addNodeDefaultHandler={this.addNodeDefaultHandler}
				onEditCollectionSubmit={this.onEditCollectionSubmit} onEditNodeSubmit={this.onEditNodeSubmit}
			/>;
			if(item.type === "journey")
				journeyElements.push(component);
			else if(item.type === "cognate")
				cognateElements.push(component);
		});

		if(journeyElements.length > 0)
		{
			journeys =
				<>
					<div className={"header-container"}>
						<h2>Journeys</h2>
						<Button value={"+"} id={"manual-add"} style={{alignSelf: "end"}} onClick={(e) =>
						{
							this.openModal(e, <AddEditCollectionModal onCollectionSubmit={this.onAddCollectionSubmit}/>);
						}}/>
					</div>
					{journeyElements}
				</>;
		}
		if(cognateElements.length > 0)
		{
			cognates =
				<>
					<div className={"header-container"}>
						<h2>Cognates</h2>
						<Button value={"+"} id={"manual-add"} style={{alignSelf: "end"}} onClick={(e) =>
						{
							this.openModal(e, <AddEditCollectionModal onCollectionSubmit={this.onAddCollectionSubmit}
							                                          type={"Cognates"}/>);
						}}/>
					</div>
					{cognateElements}
				</>;
		}

		return (
			<div className={"collections-container"}>
				{journeys}
				{cognates}
			</div>
		);
	}
}