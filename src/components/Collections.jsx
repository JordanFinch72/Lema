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

		/* Click, event handlers */
		this.addCollection = this.addCollection.bind(this);
		this.editCollection = this.editCollection.bind(this);
		this.addNode = this.addNode.bind(this);
		this.editNode = this.editNode.bind(this);
		this.editNodeColour = this.editNodeColour.bind(this);
		this.removeNode = this.removeNode.bind(this);
		this.cAddNode = this.cAddNode.bind(this);
		this.cAddNodeDefault = this.cAddNodeDefault.bind(this);
		this.cRemoveCollection = this.cRemoveCollection.bind(this);

		/* Prop functions */
		this.openModal = this.props.openModal.bind(this);
		this.closeModal = this.props.closeModal.bind(this);
		this.openContextMenu = this.props.openContextMenu.bind(this);
		this.closeContextMenu = this.props.closeContextMenu.bind(this);
	}

	editNodeColour(e, node)
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
	removeNode(e, parentIndex, childIndex)
	{
		let newItems = this.state.items;
		delete newItems[parentIndex].childNodes[childIndex];
		this.setState({items: newItems}, function()
		{
			console.log(this.state);
		});
	}

	addCollection(e, data)
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
	editCollection(e, data)
	{
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
	cAddNode(e, parentIndex)
	{
		// Open the AddEditNodeModal
		this.openModal(e, <AddEditNodeModal onNodeSubmit={this.addNode} parentIndex={parentIndex}/>);
	}
	cAddNodeDefault(e, parentIndex)
	{
		this.addNode(e, {word: "word", language: "language", parentIndex: parentIndex});
	}
	cRemoveCollection(e, index)
	{
		let newItems = this.state.items;
		delete newItems[index];
		this.setState({items: newItems});
	}
	addNode(e, data)
	{
		// Data validation
		let errorCollector = "";
		if(data.word === null || data.word.length <= 0)
			errorCollector += "You must enter a word.\n";
		if(data.language === null || data.language.length <= 0)
			errorCollector += "You must enter a language.\n";

		if(errorCollector.length > 0)
			alert(errorCollector); // TODO: Proper error message with toast
		else
		{
			// Create new child node
			let newChildNode = {word: data.word, language: data.language};
			let newItems = this.state.items;
			newItems[data.parentIndex].childNodes.push(newChildNode); // Data contains parent Journey component's index (its location in this.state.items array)

			this.setState({items: newItems}, this.closeModal);
		}
	}
	editNode(e, data)
	{
		// Data validation
		let errorCollector = "";
		if(data.word === null || data.word.length <= 0)
			errorCollector += "You must enter a word.\n";
		if(data.language === null || data.language.length <= 0)
			errorCollector += "You must enter a language.\n";

		if(errorCollector.length > 0)
			alert(errorCollector); // TODO: Proper error message with toast
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
		let journeys = null, cognates = null;
		let journeyElements = [], cognateElements = [];
		this.state.items.map((item, index) =>
		{
			if(typeof item !== "undefined")
			{
				let component = <Collection
					key={index} index={index} type={item.type} header={item.header} openModal={this.openModal}
					childNodes={item.childNodes} editCollection={this.editCollection}
					openContextMenu={this.openContextMenu} closeContextMenu={this.closeContextMenu}
					cAddNode={this.cAddNode} cAddNodeDefault={this.cAddNodeDefault} cRemoveCollection={this.cRemoveCollection}
					addNode={this.addNode} editNode={this.editNode} removeNode={this.removeNode} editNodeColour={this.editNodeColour}
				/>;
				if(item.type === "journey")
					journeyElements.push(component);
				else if(item.type === "cognate")
					cognateElements.push(component);
			}
		});

		if(journeyElements.length > 0)
		{
			journeys =
				<>
					<div className={"header-container"}>
						<h2>Journeys</h2>
						<Button value={"+"} id={"manual-add"} style={{alignSelf: "end"}}
						        onClick={(e) => {
									this.openModal(e, <AddEditCollectionModal onCollectionSubmit={this.addCollection}/>);
								}}
						/>
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
						<Button value={"+"} id={"manual-add"} style={{alignSelf: "end"}}
						        onClick={(e) => {
									this.openModal(e, <AddEditCollectionModal onCollectionSubmit={this.addCollection} type={"cognate"}/>);
								}}
						/>
					</div>
					{cognateElements}
				</>;
		}
		if(journeyElements.length <= 0 && cognateElements.length <= 0) // Default just say "Collections"; re-using journeys variable
		{
			journeys =
				<>
					<div className={"header-container"}>
						<h2>Collections</h2>
						<Button value={"+"} id={"manual-add"} style={{alignSelf: "end"}}
						        onClick={(e) => {
							        this.openModal(e, <AddEditCollectionModal onCollectionSubmit={this.addCollection}/>);
						        }}
						/>
					</div>
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