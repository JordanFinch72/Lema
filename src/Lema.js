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
			collections: [],
			journeyCount: 0
		};

		this.defaultJourneyColours = ["#ff0000", "#00ff00", "#0000ff", "#da35aa", "#ffcc00"] // TODO: Better colours

		this.flattenTree = this.flattenTree.bind(this);
		this.openModal = this.openModal.bind(this);
		this.closeModal = this.closeModal.bind(this);
		this.openContextMenu = this.openContextMenu.bind(this);
		this.closeContextMenu = this.closeContextMenu.bind(this);
		this.addCollection = this.addCollection.bind(this);
		this.editCollection = this.editCollection.bind(this);
		this.addJourneyFromDatabase = this.addJourneyFromDatabase.bind(this);
		this.addNode = this.addNode.bind(this);
		this.editNode = this.editNode.bind(this);
		this.removeNode = this.removeNode.bind(this);
		this.removeCollection = this.removeCollection.bind(this);
	}

	flattenTree(wordArray, edWords, structure, wordID, affixesArray = null)
	{
		let parents = [], wordObject = {};
		// Parents
		if(Object.keys(structure).length > 0)
		{
			// Loop through parents
			for(let wordID in structure)
			{
				if((affixesArray !== null && !affixesArray.includes(Number(wordID)))
					|| affixesArray == null)
				{
					parents.push(wordID);
					wordArray = this.flattenTree(wordArray, edWords, structure[wordID], wordID, affixesArray);
				}
			}
		}

		// Retrieve word from ED and convert to Lema-compatible object
		if(wordID !== null)
		{
			wordObject = edWords[wordID];
			wordObject = {
				id: Number(wordID),
				arrayIndex: wordArray.length,
				word: wordObject.word,
				language: wordObject.language_name,
				parents: [],
				vertex: {type: "word", customText: "", fontColour: "#000000", strokeColour: "#000000", fillColour: this.defaultJourneyColours[this.state.journeyCount], radius: null, fontSize: null, x: null, y: null, edgeStart: "centre", edgeEnd: "centre", edgeStrokeColour: "#000000", edgeStrokeWidth: "2px", edgeArrowheadEnabled: true, edgeArrowheadStrokeColour: "#000000", edgeArrowheadFillColour: "#000000"}
			}
			for(let i = 0; i < parents.length; ++i)
			{
				let parentID = Number(parents[i]);
				let parent = wordArray.find(({id}) => id === parentID);
				if((affixesArray !== null && !affixesArray.includes(parentID))
					|| affixesArray === null)
				{
					wordObject.parents.push(parent);
				}
			}
			wordArray.push(wordObject);
		}
		return wordArray;
	}

	addJourneyFromDatabase(edWords, edStructure, edAffixes = null)
	{
		let newCollections = this.state.collections, newJourneyCount = this.state.journeyCount;

		// Flatten the structure
		let journeyWords = [];
		journeyWords = this.flattenTree(journeyWords, edWords, edStructure, null, edAffixes);
		console.log(journeyWords);

		// Create the new journey and add it to collections
		let newJourney = {type: "journey", header: {word: journeyWords[journeyWords.length-1].word, language: journeyWords[journeyWords.length-1].language}, words: journeyWords};
		newCollections.push(newJourney);

		this.setState({collections: newCollections, journeyCount: newJourneyCount+1});
	}

	openModal(e, modalComponent)
	{
		this.setState({
			activeModal: modalComponent
		});
	}
	closeModal()
	{
		if(this.state.activeModal)
		{
			this.setState({
				activeModal: null
			});
		}
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

	addNode(e, collectionIndex, newNode)
	{
		// Data validation
		let errorCollector = "";
		if(this.state.collections[collectionIndex].type === "cognate")
		{
			// Check for existing language
			for(let i = 0; i < this.state.collections[collectionIndex].words.length; ++i)
			{
				let childNode = this.state.collections[collectionIndex].words[i];
				if(childNode.language === newNode.language)
				{
					errorCollector += "A language can only appear in a cognate collection once.\n" +
									  "Additional cognate collections may contain a language used in another cognate collection.";
					break;
				}
			}
		}

		if(errorCollector.length > 0)
			alert(errorCollector); // TODO: Proper error message with toast
		else
		{
			// Insert new node
			let newCollections = this.state.collections;
			newNode.arrayIndex = newCollections[collectionIndex].words.length;
			newCollections[collectionIndex].words.push(newNode);

			this.setState({collections: newCollections});
		}
	}

	/**
	 * Updates the state's collections array with updated node
	 * @param e React SyntheticEvent
	 * @param collectionIndex Index of collection to which the node belongs
	 * @param updatedNode The updated node to be set in the collections array
	 */
	editNode(e, collectionIndex, updatedNode)
	{
		let newCollections = this.state.collections;
		console.log(e);
		console.log(collectionIndex);
		console.log(updatedNode);

		// Find node
		let node = newCollections[collectionIndex].words[updatedNode.arrayIndex];

		// Update node by reference
		for(let index in updatedNode)
			if(node[index]) node[index] = updatedNode[index];

		this.setState({collections: newCollections}, () => {
			console.log("Post-edit collections: ");
			console.log(this.state.collections);
			this.closeModal();
		});
	}
	removeNode(e, collectionIndex, arrayIndex)
	{
		let newCollections = this.state.collections;

		// Find node
		let node = newCollections[collectionIndex].words[arrayIndex];
		let confirmed = false;
		if(node.parents.length > 0)
			confirmed = window.confirm("Warning: this node is connected to "+node.parents.length+" parent nodes. The nodes will be unaffected by the deletion. Do you still wish to delete?");
		else
			confirmed = window.confirm("Are you sure you wish to delete this node?");

		if(confirmed)
			newCollections[collectionIndex].words.splice(arrayIndex, 1); // Delete node

		this.setState({collections: newCollections}, this.closeModal);
	}

	addCollection(e, data)
	{
		console.log(data);

		let newCollections = this.state.collections;
		newCollections.push({type: data.type, header: data.header, words: []});
		this.setState( {collections: newCollections}, this.closeModal);
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

		return (
			<div className="Lema">
				<Banner/>
				<div className={"main-view-container"}>
					<LeftBar collections={this.state.collections}
					         openModal={this.openModal} closeModal={this.closeModal}
					         openContextMenu={this.openContextMenu} closeContextMenu={this.closeContextMenu}
					         addJourneyFromDatabase={this.addJourneyFromDatabase}
					         addNode={this.addNode} editNode={this.editNode} editNodeColour={this.editNodeColour} removeNode={this.removeNode}
					         addCollection={this.addCollection} editCollection={this.editCollection} removeCollection={this.removeCollection}
					/>
					<Map collections={this.state.collections} mapRenderCounter={this.state.mapRenderCounter}
					     openContextMenu={this.openContextMenu} closeContextMenu={this.closeContextMenu}
					     openModal={this.openModal} closeModal={this.closeModal}
						 addNode={this.addNode} editNode={this.editNode} editNodeColour={this.editNodeColour} removeNode={this.removeNode}
					/>
				</div>
				{modalContainer}
				{contextMenuContainer}
			</div>
		);
	}
}

export default Lema;
