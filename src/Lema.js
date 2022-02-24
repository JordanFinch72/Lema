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
			collections: [

				/*{
					type: "journey",
					header: {word: "horse", language: "English (GB)"},
					words: [
						{word: "kers", language: "Proto-Indo-European", colour: "#000000", vertex: {type: "word", strokeColour: "#000000", fillColour: "#FFFFFF", radius: null, fontSize: null, x: null, y: null, edgeStart: "centre", edgeEnd: "centre"}},
						{word: "krsos", language: "Proto-Indo-European", colour: "#000000", vertex: {type: "word", strokeColour: "#000000", fillColour: "#FFFFFF", radius: null, fontSize: null, x: null, y: null, edgeStart: "centre", edgeEnd: "centre"}},
						{word: "hrussa", language: "Proto-Germanic", colour: "#000000", vertex: {type: "word", strokeColour: "#000000", fillColour: "#FFFFFF", radius: null, fontSize: null, x: null, y: null, edgeStart: "centre", edgeEnd: "centre"}},
						{word: "hross", language: "Proto-West-Germanic", colour: "#000000", vertex: {type: "word", strokeColour: "#000000", fillColour: "#FFFFFF", radius: null, fontSize: null, x: null, y: null, edgeStart: "centre", edgeEnd: "centre"}},
						{word: "horse", language: "English (GB)", colour: "#000000", vertex: {type: "word", strokeColour: "#000000", fillColour: "#FFFFFF", radius: null, fontSize: null, x: null, y: null, edgeStart: "centre", edgeEnd: "centre"}}
					]
				},*/
				{
					type: "journey",
					header: {word: "Pferd", language: "German"},
					words: [
						{id: 1, word: "Pferd", language: "German", colour: "#000000", vertex: {type: "word", strokeColour: "#000000", fillColour: "#FFFFFF", radius: null, fontSize: null, x: null, y: null, edgeStart: "centre", edgeEnd: "centre"}, parents: [
								{id: 2, word: "pfarifrit", language: "Old High German", colour: "#000000", vertex: {type: "word", strokeColour: "#000000", fillColour: "#FFFFFF", radius: null, fontSize: null, x: null, y: null, edgeStart: "centre", edgeEnd: "centre"}, parents: [
										{id: 4, word: "paraveredus", language: "Latin", colour: "#000000", vertex: {type: "word", strokeColour: "#000000", fillColour: "#FFFFFF", radius: null, fontSize: null, x: null, y: null, edgeStart: "centre", edgeEnd: "centre"}, parents: [
												{id: 6, word: "veredus", language: "Latin", colour: "#000000", vertex: {type: "word", strokeColour: "#000000", fillColour: "#FFFFFF", radius: null, fontSize: null, x: null, y: null, edgeStart: "centre", edgeEnd: "centre"}, parents: [
														{id: 8, word: "werēdos", language: "Gaulish", colour: "#000000", vertex: {type: "word", strokeColour: "#000000", fillColour: "#FFFFFF", radius: null, fontSize: null, x: null, y: null, edgeStart: "centre", edgeEnd: "centre"}, parents: [
																{id: 10, word: "uɸorēdos", language: "Proto-Celtic", colour: "#000000", vertex: {type: "word", strokeColour: "#000000", fillColour: "#FFFFFF", radius: null, fontSize: null, x: null, y: null, edgeStart: "centre", edgeEnd: "centre"}, parents: [
																		{id: 12, word: "uɸo", language: "Proto-Celtic", colour: "#000000", vertex: {type: "word", strokeColour: "#000000", fillColour: "#FFFFFF", radius: null, fontSize: null, x: null, y: null, edgeStart: "centre", edgeEnd: "centre"}, parents: [
																				{id: 14, word: "upo", language: "Proto-Indo-European", colour: "#000000", vertex: {type: "word", strokeColour: "#000000", fillColour: "#FFFFFF", radius: null, fontSize: null, x: null, y: null, edgeStart: "centre", edgeEnd: "centre"}}
																			]},
																		{id: 13, word: "rēdos", language: "Proto-Celtic", colour: "#000000", vertex: {type: "word", strokeColour: "#000000", fillColour: "#FFFFFF", radius: null, fontSize: null, x: null, y: null, edgeStart: "centre", edgeEnd: "centre"}}
																	]}
															]}
													]}
											]},
										{id: 5, word: "paraveredus", language: "Late Latin", colour: "#000000", vertex: {type: "word", strokeColour: "#000000", fillColour: "#FFFFFF", radius: null, fontSize: null, x: null, y: null, edgeStart: "centre", edgeEnd: "centre"}, parents: [
												{id: 7, word: "παρά", language: "Ancient Greek", colour: "#000000", vertex: {type: "word", strokeColour: "#000000", fillColour: "#FFFFFF", radius: null, fontSize: null, x: null, y: null, edgeStart: "centre", edgeEnd: "centre"}, parents: [
														{id: 9, word: "preh₂-", language: "Proto-Indo-European", colour: "#000000", vertex: {type: "word", strokeColour: "#000000", fillColour: "#FFFFFF", radius: null, fontSize: null, x: null, y: null, edgeStart: "centre", edgeEnd: "centre"}, parents: [
																{id: 11, word: "per-", language: "Proto-Indo-European", colour: "#000000", vertex: {type: "word", strokeColour: "#000000", fillColour: "#FFFFFF", radius: null, fontSize: null, x: null, y: null, edgeStart: "centre", edgeEnd: "centre"}}
															]}
													]}
											]}
									]},
								{id: 3, word: "pferift", language: "Middle High German", colour: "#000000", vertex: {type: "word", strokeColour: "#000000", fillColour: "#FFFFFF", radius: null, fontSize: null, x: null, y: null, edgeStart: "centre", edgeEnd: "centre"}}
							]}
					]
				},
				/*{   /!* One word, all cognates (same ancestor). TODO: Legend should detail the ancestors *!/
					type: "cognate",
					header: {word: "palfrey", language: "English (GB)"},
					words: [
						{word: "palfrey", language: "English (GB)", colour: "#f5b60d"},
						{word: "paard", language: "Dutch", colour: "#f5b60d"},
						{word: "Pferd", language: "German", colour: "#f5b60d"},
						{word: "Päerd", language: "Luxembourgish", colour: "#f5b60d"},
						{word: "פערד", language: "Yiddish", colour: "#f5b60d"}
					]
				},*/
					// TODO: Multiple cognate collections at once (separate layers/patterned colours)
				/*{   /!* Multiple words, no shared countries. Demonstrates cognates of same English word across different families/languages. *!/
					type: "cognate",
					header: {word: "smith", language: "English (GB)"},
					words: [
						{word: "smith", language: "English (GB)", colour: "#f5b60d", label: {type: "country", customText: "", fontColour: "#000000", fontSize: null, x: null, y: null}},
						{word: "smid", language: "Dutch", colour: "#f5b60d", label: {type: "country", customText: "", fontColour: "#000000", fontSize: null, x: null, y: null}},
						{word: "Schmidt", language: "German", colour: "#f5b60d", label: {type: "country", customText: "", fontColour: "#000000", fontSize: null, x: null, y: null}},
						{word: "smed", language: "Danish", colour: "#f5b60d", label: {type: "country", customText: "", fontColour: "#000000", fontSize: null, x: null, y: null}},
						{word: "smed", language: "Norwegian", colour: "#f5b60d", label: {type: "country", customText: "", fontColour: "#000000", fontSize: null, x: null, y: null}},
						{word: "smed", language: "Swedish", colour: "#f5b60d", label: {type: "country", customText: "", fontColour: "#000000", fontSize: null, x: null, y: null}},
						{word: "smiður", language: "Icelandic", colour: "#f5b60d", label: {type: "country", customText: "", fontColour: "#000000", fontSize: null, x: null, y: null}},
						{word: "forgeron", language: "French", colour: "#0000ff", label: {type: "country", customText: "", fontColour: "#000000", fontSize: null, x: null, y: null}},
						{word: "fabbro", language: "Italian", colour: "#0000ff", label: {type: "country", customText: "", fontColour: "#000000", fontSize: null, x: null, y: null}},
						{word: "Kovář", language: "Czech", colour: "#ff0000", label: {type: "country", customText: "", fontColour: "#000000", fontSize: null, x: null, y: null}},
						{word: "kováč", language: "Slovak", colour: "#ff0000", label: {type: "country", customText: "", fontColour: "#000000", fontSize: null, x: null, y: null}},
						{word: "kowal", language: "Polish", colour: "#ff0000", label: {type: "country", customText: "", fontColour: "#000000", fontSize: null, x: null, y: null}}
					]
				}*/
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
		this.addNodeDefault = this.addNodeDefault.bind(this);
		this.editNode = this.editNode.bind(this);
		this.removeNode = this.removeNode.bind(this);
		this.removeCollection = this.removeCollection.bind(this);
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

	addNode(e, data)
	{
		// Data validation
		let errorCollector = "";
		if(data.word === null || data.word.length <= 0)
			errorCollector += "You must enter a word.\n";
		if(data.language === null || data.language.length <= 0)
			errorCollector += "You must enter a language.\n";
		if(this.state.collections[data.collectionIndex].type === "cognate")
		{
			// Check for existing language
			for(let i = 0; i < this.state.collections[data.collectionIndex].words.length; ++i)
			{
				let childNode = this.state.collections[data.collectionIndex].words[i];
				if(childNode.language === data.language)
				{
					errorCollector += "A language may only have one word per cognate collection.\n" +
									  "Additional cognate collections may re-use languages in other cognate collections.";
					break;
				}
			}
		}

		if(errorCollector.length > 0)
			alert(errorCollector); // TODO: Proper error message with toast
		else
		{
			// Create new child node
			let newChildNode = {word: data.word, language: data.language};
			let newCollections = this.state.collections;
			newCollections[data.collectionIndex].words.push(newChildNode); // Data contains parent Journey component's index (its location in this.state.collections array)

			this.setState({collections: newCollections}, this.closeModal);
		}
	}
	addNodeDefault(e, data)
	{
		// Create new child node
		let newChildNode;
		if(data.type === "journey")
		{
			newChildNode = {word: "word", language: "language", colour: "#000000", vertex: {type: "word", strokeColour: "#000000", fillColour: "#FFFFFF", radius: null, fontSize: null, x: null, y: null, edgeStart: "centre", edgeEnd: "centre"}};
		}
		else if(data.type === "cognate")
		{
			newChildNode = {word: "word", language: "language", colour: "#000000", label: {type: "language", customText: "", fontColour: "#000000", fontSize: null, x: null, y: null}};
		}
		let newCollections = this.state.collections;
		newCollections[data.collectionIndex].words.push(newChildNode); // Data contains parent Journey component's index (its location in this.state.collections array)

		this.setState({collections: newCollections}, this.closeModal);
	}

	/**
	 * Updates the state's collections array with updated node
	 * @param e React SyntheticEvent
	 * @param collectionIndex Index of collection to which the node belongs
	 * @param indexChain Index chain to find node within the specified collection
	 * @param updatedNode The updated node to be set in the collections array
	 */
	editNode(e, collectionIndex, indexChain, updatedNode)
	{
		let newCollections = this.state.collections;
		indexChain = indexChain.split("->"); // Note: indexes are returned as strings, but JS doesn't seem to mind

		// Find node via index chain
		let node = newCollections[collectionIndex].words[indexChain[0]]; // Beginning of chain is always 0
		for(let i = 1; i < indexChain.length; ++i)
		{
			node = node.parents[indexChain[i]];
		}

		// Update node by reference
		for(let index in updatedNode)
			if(node[index]) node[index] = updatedNode[index];

		this.setState({collections: newCollections}, () => {
			console.log("Post-edit collections: ");
			console.log(this.state.collections);
			if(this.state.activeModal)
				this.closeModal();
		});
	}
	removeNode(e, collectionIndex, indexChain)
	{
		let newCollections = this.state.collections;
		indexChain = indexChain.split("->"); // Note: indexes are returned as strings, but JS doesn't seem to mind

		// Find node via index chain
		let node = newCollections[collectionIndex].words[indexChain[0]]; // Beginning of chain is always 0
		for(let i = 1; i < indexChain.length; ++i)
		{
			if(i+1 === indexChain.length) // End of chain == node to delete
			{
				let confirmed = false;
				if(node.parents[indexChain[i]].parents)
					confirmed = window.confirm("Warning: this node has "+node.parents[indexChain[i]].parents.length+" parent nodes that will be deleted as well. Do you still wish to delete?");
				else
					confirmed = window.confirm("Are you sure you wish to delete this node?")

				if(confirmed)
					node.parents.splice(indexChain[i], 1); // Delete by reference
			}
			else
				node = node.parents[indexChain[i]];
		}

		this.setState({collections: newCollections}, this.closeModal);
	}

	addCollection(e, data)
	{
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
			let newCollections = this.state.collections;
			newCollections.push({type: data.type, header: data.header, words: []});
			this.setState( {collections: newCollections}, this.closeModal);
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
			let newCollections = this.state.collections;
			newCollections[data.index].type = data.type;
			newCollections[data.index].header = data.header;
			this.setState({collections: newCollections, mapRenderCounter: this.state.mapRenderCounter+1}, this.closeModal);
		}
	}
	removeCollection(e, collectionIndex)
	{
		let newCollections = this.state.collections;
		newCollections.splice(collectionIndex, 1);
		this.setState({collections: newCollections}, function()
		{
			console.log(this.state);
		});
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

		//console.log(this.state.collections);

		return (
			<div className="Lema">
				<Banner/>
				<div className={"main-view-container"}>
					<LeftBar collections={this.state.collections}
					         openModal={this.openModal} closeModal={this.closeModal}
					         openContextMenu={this.openContextMenu} closeContextMenu={this.closeContextMenu}
					         addNode={this.addNode} addNodeDefault={this.addNodeDefault} editNode={this.editNode} editNodeColour={this.editNodeColour} removeNode={this.removeNode}
					         addCollection={this.addCollection} editCollection={this.editCollection} removeCollection={this.removeCollection}
					/>
					<Map collections={this.state.collections} mapRenderCounter={this.state.mapRenderCounter}
					     openContextMenu={this.openContextMenu} closeContextMenu={this.closeContextMenu}
					     openModal={this.openModal} closeModal={this.closeModal}
						 addNode={this.addNode} editNode={this.editNode} editNodeColour={this.editNodeColour} removeNode={this.removeNode}  />
				</div>
				{modalContainer}
				{contextMenuContainer}
			</div>
		);
	}
}

export default Lema;
