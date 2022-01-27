import "./css/Lema.css";
import {Component} from "react";
import {Banner} from "./components/Banner";
import {LeftBar} from "./components/LeftBar";
import {Map} from "./components/Map";

class Lema extends Component
{
	constructor(props)
	{
		super(props);

		this.state = {
			activeModal: null, // Either null or a React component
			activeContextMenu: null, // Either null or a React component
			mapRef: null,
			items: [
				{
					type: "journey",
					header: {word: "horse", language: "English (GB)"},
					childNodes: [
						{word: "kers", language: "Proto-Indo-European", colour: "#000000"},
						{word: "krsos", language: "Proto-Indo-European", colour: "#000000"},
						{word: "hrussa", language: "Proto-Germanic", colour: "#000000"},
						{word: "hross", language: "Proto-West-Germanic", colour: "#000000"},
						{word: "horse", language: "English (GB)", colour: "#000000"}
					]
				},
				{
					type: "cognate",
					header: {word: "horse", language: "English (GB)"},
					childNodes: [
						{word: "horse", language: "English (GB)", colour: "#ff0000"},
						{word: "paard", language: "Dutch", colour: "#f5b60d"},
						{word: "Pferd", language: "German", colour: "#f5b60d"},
						{word: "hest", language: "Danish", colour: "#0000ff"},
						{word: "hest", language: "Norwegian", colour: "#0000ff"},
						{word: "häst", language: "Swedish", colour: "#0000ff"}
					]
				}
			],
			mapRenderCounter: 0
		};

		this.openModal = this.openModal.bind(this);
		this.closeModal = this.closeModal.bind(this);
		this.openContextMenu = this.openContextMenu.bind(this);
		this.closeContextMenu = this.closeContextMenu.bind(this);
		this.addCollection = this.addCollection.bind(this);
		this.editCollection = this.editCollection.bind(this);
		this.addNode = this.addNode.bind(this);
		this.editNode = this.editNode.bind(this);
		this.editNodeColour = this.editNodeColour.bind(this);
		this.removeNode = this.removeNode.bind(this);
	}

	openModal(e, modalComponent)
	{
		this.setState({
			activeModal: modalComponent
		});
	}
	closeModal()
	{
		this.setState({
			activeModal: null
		});
	}
	openContextMenu(e, menuComponent)
	{
		this.setState({
			activeContextMenu: menuComponent
		});
	}
	closeContextMenu()
	{
		this.setState({
			activeContextMenu: null
		});
	}

	editNodeColour(e, parentIndex, childIndex, colour)
	{
		// Find node and set colour
		let newItems = this.state.items;
		newItems[parentIndex].childNodes[childIndex].colour = colour;
		this.setState({items: newItems, mapRenderCounter: this.state.mapRenderCounter+1});
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
		console.log(data);

		if(data.type === "Cognates") data.type = "cognate";
		else if(data.type === "Historical journey") data.type = "journey";

		// Data validation
		// TODO: For cognates, only one cognate per language should be allowed
		//  - Future feature: for additional cognate collections, change solid colours to patterns of the specified colours instead (e.g. stripes; checks)
		let errorCollector = "";
		if(data.header.word === null || data.header.word.length <= 0)
			errorCollector += "You must enter a word.\n";
		if(data.header.language === null || data.header.language.length <= 0)
			errorCollector += "You must enter a language.\n";

		if(errorCollector.length > 0)
			alert(errorCollector); // TODO: Proper error handling with toast
		else
		{
			let items = this.state.items;
			items.push({type: data.type, header: data.header, childNodes: []});
			this.setState( {items: items}, this.closeModal);
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

		if(errorCollector.length > 0)
			alert(errorCollector); // TODO: Proper error handling with toast
		else
		{
			let newItems = this.state.items;
			newItems[data.index].type = data.type;
			newItems[data.index].header = data.header;
			this.setState({items: newItems, mapRenderCounter: this.state.mapRenderCounter+1}, this.closeModal);
		}

	}

	render()
	{
		let modalContainer = null, contextMenuContainer = null;
		if(this.state.activeModal !== null)
		{
			let activeModal = this.state.activeModal;
			modalContainer = <div className={"modal-container"} onClick={(e) =>
			{
				if(e.nativeEvent.target.className === "modal-container") this.closeModal(); // Closes modal if they click off the modal
			}}>{activeModal}</div>;
		}
		if(this.state.activeContextMenu !== null)
		{
			let activeContextMenu = this.state.activeContextMenu;
			contextMenuContainer =
				<div className={"context-menu-container"} onClick={this.closeContextMenu}>{activeContextMenu}</div>;
		}

		return (
			<div className="Lema">
				<Banner/>
				<div className={"main-view-container"}>
					<LeftBar items={this.state.items}
					         openModal={this.openModal} closeModal={this.closeModal}
					         openContextMenu={this.openContextMenu} closeContextMenu={this.closeContextMenu}
					         addNode={this.addNode} editNode={this.editNode} editNodeColour={this.editNodeColour} removeNode={this.removeNode}
					         addCollection={this.addCollection} editCollection={this.editCollection}
					/>
					<Map items={this.state.items} mapRenderCounter={this.state.mapRenderCounter} />
				</div>
				{modalContainer}
				{contextMenuContainer}
			</div>
		);
	}
}

export default Lema;
