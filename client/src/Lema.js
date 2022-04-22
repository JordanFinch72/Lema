import "./css/Lema.css";
import {Component} from "react";
import {Banner} from "./components/Banner";
import {LeftBar} from "./components/LeftBar";
import {Map} from "./components/Map";
import axios from "axios";

class Lema extends Component
{
	constructor(props)
	{
		super(props);

		this.state = {
			activeModal: null,       // Either null or a React component
			activeContextMenu: null, // Either null or a React component
			activeUser: null,        // Set upon user login
			activeMapID: null,      // Either null, set by load function, or set by save function once saved to profile
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
		this.authenticateUser = this.authenticateUser.bind(this);
		this.registerUser = this.registerUser.bind(this);
		this.saveMap = this.saveMap.bind(this);
	}

	componentDidMount()
	{
		// TODO: Check if user is already logged in (cookies)
	}

	/**
	 * Sends log in data to server to authenticate user.
	 * @param e SyntheticEvent
	 * @param data Login data
	 */
	authenticateUser(e, data)
	{
		// Check the user
		const username = data.loginUsername;
		const password = data.loginPassword;
		const rememberMe = data.rememberMe; // TODO: This

		axios.get(`users/${username}/${password}`).then((response) => {
			if(this.handleResponse(response, "User found.", "Login successful!"))
				this.setState({activeUser: response.data.user});
		});

		/*axios.get(`users/${username}/${password}`).then((response) => {
			console.log(response);
			if(response.data.type === "error")
			{
				console.error(response.data.message);
				alert(response.data.message);
			}
			else if(response.data.type === "success")
			{
				console.log(response.data);
				if(response.data.message === "User found.")
				{
					alert("Login successful!");
					this.setState({activeUser: response.data.user}, this.closeModal);
				}
			}
		});*/
	}
	/**
	 * Sends register data to server to create a new user profile.
	 * @param e SyntheticEvent
	 * @param data Registration data
	 */
	registerUser(e, data)
	{
		// Register the user
		const {displayName, username, password, email} = data;

		axios.put(`users/${displayName}/${username}/${password}/${email}`).then((response) => {
			this.handleResponse(response, "User created.", "Profile created! You may now log in.");
		});

		/*axios.put(`users/${displayName}/${username}/${password}/${email}`).then((response) => {
			console.log(response);
			if(response.data.type === "error")
			{
				console.error(response.data.message);
				alert(response.data.message);
			}
			else if(response.data.type === "success")
			{
				console.log(response.data);
				if(response.data.message === "User created.")
				{
					alert("Profile created! You may now log in.");
					this.closeModal();
				}
			}
		});*/
	}

	/**
	 * A recursive function that flattens the nested data structure returned from the etymological database into an
	 * array of word nodes.
	 * @param wordArray Flat array of words (initially empty)
	 * @param edWords Object of words returned by the etymological database
	 * @param edStructure Original data structure returned by the etymological database
	 * @param edAffixes Array of affixed returned by the etymological database (used to filter out affixes)
	 * @param wordID The ID of the word currently being operated on in the recursive function
	 * @returns {array} The wordArray object, which has nodes pushed to it throughout the function
	 */
	flattenTree(wordArray, edWords, edStructure, wordID, edAffixes = null)
	{
		let parents = [], wordNode = {};
		// Parents
		if(Object.keys(edStructure).length > 0)
		{
			// Loop through parents
			for(const wordID in edStructure)
			{
				if((edAffixes !== null && !edAffixes.includes(Number(wordID)))
					|| edAffixes == null)
				{
					parents.push(wordID);
					wordArray = this.flattenTree(wordArray, edWords, edStructure[wordID], wordID, edAffixes);
				}
			}
		}

		// Retrieve word from ED and convert to Lema-compatible object
		if(wordID !== null)
		{
			wordNode = edWords[wordID];
			wordNode = {
				id: Number(wordID),
				arrayIndex: wordArray.length,
				word: wordNode.word,
				language: wordNode.language_name,
				parents: [],
				vertex: {type: "word", customText: "", fontColour: "#000000", strokeColour: "#000000", fillColour: this.defaultJourneyColours[this.state.journeyCount], radius: null, fontSize: null, x: null, y: null, edgeStart: "centre", edgeEnd: "centre", edgeStrokeColour: "#000000", edgeStrokeWidth: "2px", edgeArrowheadEnabled: true, edgeArrowheadStrokeColour: "#000000", edgeArrowheadFillColour: "#000000"}
			}
			for(let i = 0; i < parents.length; ++i)
			{
				const parentID = Number(parents[i]);
				const parent = wordArray.find(({id}) => id === parentID);
				if((edAffixes !== null && !edAffixes.includes(parentID))
					|| edAffixes === null)
				{
					wordNode.parents.push(parent);
				}
			}
			wordArray.push(wordNode);
		}
		return wordArray;
	}

	/**
	 * Creates a journey collection from words returned by the etymological database and automatically adds them to the existing journey collections array
	 * @param edWords Object of words returned by the etymological database
	 * @param edStructure Original data structure returned by the etymological database
	 * @param edAffixes Array of affixed returned by the etymological database (used to filter out affixes)
	 */
	addJourneyFromDatabase(edWords, edStructure, edAffixes = null)
	{
		const newCollections = this.state.collections, newJourneyCount = this.state.journeyCount;

		// Flatten the data structure
		let journeyWords = [];
		journeyWords = this.flattenTree(journeyWords, edWords, edStructure, null, edAffixes);
		console.log(journeyWords);

		// Create the new journey and add it to collections
		const newJourney = {type: "journey", header: {word: journeyWords[journeyWords.length-1].word, language: journeyWords[journeyWords.length-1].language}, words: journeyWords};
		newCollections.push(newJourney);

		this.setState({collections: newCollections, journeyCount: newJourneyCount+1});
	}

	/**
	 * Opens a modal if one is not already open.
	 * @param e SyntheticEvent
	 * @param modalComponent React component of the modal that is to be opened.
	 */
	openModal(e, modalComponent)
	{
		if(!this.state.activeModal)
			this.setState({activeModal: modalComponent});
	}

	/**
	 * Closes any currently-open modal.
	 */
	closeModal()
	{
		if(this.state.activeModal)
			this.setState({activeModal: null});
	}

	/**
	 * Opens a context menu if one is not already open.
	 * Note: currently, only one context menu can be active at a time. This means context menus' items must not attempt to open a context menu on themselves.
	 * @param e
	 * @param menuComponent A React component of the context menu that is to be opened.
	 */
	openContextMenu(e, menuComponent)
	{
		if(!this.state.activeContextMenu)
			this.setState({activeContextMenu: menuComponent});
	}

	/**
	 * Closes any currently-open context menu.
	 */
	closeContextMenu()
	{
		if(this.state.activeContextMenu)
			this.setState({activeContextMenu: null});
	}

	/**
	 * Adds a node to the specified collection in the state's collection array.
	 * @param e SyntheticEvent
	 * @param collectionIndex The index of the collection to which the new node will belong.
	 * @param newNode The new node.
	 */
	addNode(e, collectionIndex, newNode, newCollectionIndex = null)
	{
		const collectionIndexActual = (newCollectionIndex !== null) ? newCollectionIndex : collectionIndex;

		// Validation (note: node data validation exists in the AddEditNodeModal)
		let errorCollector = "";
		if(this.state.collections[collectionIndexActual].type === "cognate")
		{
			// Check for existing language
			for(let i = 0; i < this.state.collections[collectionIndexActual].words.length; ++i)
			{
				const childNode = this.state.collections[collectionIndexActual].words[i];
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
			const newCollections = this.state.collections;
			newNode.arrayIndex = newCollections[collectionIndexActual].words.length;
			newCollections[collectionIndexActual].words.push(newNode);

			this.setState({collections: newCollections}, this.closeModal);
		}
	}

	/**
	 * Updates a node in the specified collection in the state's collections array with updated data.
	 * @param e React SyntheticEvent
	 * @param collectionIndex Index of collection to which the node belongs.
	 * @param updatedNode The updated node to be set in the collections array.
	 */
	editNode(e, collectionIndex, updatedNode, newCollectionIndex = null)
	{
		const newCollections = this.state.collections;
		console.log(e);
		console.log(collectionIndex);
		console.log(updatedNode);

		// Find node
		const node = newCollections[collectionIndex].words[updatedNode.arrayIndex];

		// Update node by reference
		for(const index in updatedNode)
			if(node[index]) node[index] = updatedNode[index];

		// Additional operations if node was moved from one collection to another
		if(newCollectionIndex !== null)
		{
			node.arrayIndex = newCollections[newCollectionIndex].words.length; // Update arrayIndex to reflect new collection
			node.parents.splice(0, node.parents.length);                  // Clear parents
			newCollections[newCollectionIndex].words.push(node);               // Add node to new collection
			this.removeNode(e, collectionIndex, updatedNode.arrayIndex);       // Delete node from original collection
		}

		this.setState({collections: newCollections}, () => {
			console.log("Post-edit collections: ");
			console.log(this.state.collections);
			this.closeModal();
		});
	}

	/**
	 * Removes a specified node from a specified collection in the state's collections array.
	 * The user will be warned before deletion occurs (and will be notified of any existing parents, lest they have to add them all again).
	 * @param e SyntheticEvent
	 * @param collectionIndex Index of the collection to which the node belongs.
	 * @param arrayIndex Index of the node inside the specified collection.
	 */
	removeNode(e, collectionIndex, arrayIndex)
	{
		const newCollections = this.state.collections;

		// Find node
		const node = newCollections[collectionIndex].words[arrayIndex];
		let confirmed = false;
		if(node.parents.length > 0)
			confirmed = window.confirm("Warning: this node is connected to "+node.parents.length+" parent nodes. The nodes will be unaffected by the deletion/move. Do you still wish to delete/move?");
		else
			confirmed = window.confirm("Are you sure you wish to delete/move this node?");

		if(confirmed)
		{
			newCollections[collectionIndex].words.splice(arrayIndex, 1); // Delete node

			for(let i = 0; i < newCollections[collectionIndex].words.length; ++i)
			{
				const word = newCollections[collectionIndex].words[i];
				if(word.arrayIndex > arrayIndex) word.arrayIndex = word.arrayIndex-1; // Shift down after splice

				// Delete node in parents array of others (as splice() does not delete by reference)
				for(let j = 0; j < word.parents.length; ++j)
				{
					if(word.parents[j].id === node.id)
					{
						alert("Found a parent! Get ready to splice!")
						word.parents.splice(j, 1);
					}
				}
			}
		}


		this.setState({collections: newCollections}, this.closeModal);
	}

	/**
	 * Adds a new collection to the state's collection array.
	 * @param e SyntheticEvent
	 * @param data An object containing the data required to build the new collection (collection object).
	 */
	addCollection(e, data)
	{
		const newCollections = this.state.collections;

		// Only one cognate allowed, for now // TODO
		if(data.type === "cognate" && newCollections.find(e => e.type === "cognate") !== undefined)
			alert("Support for multiple cognate collections coming soon!");
		else
		{
			newCollections.push({type: data.type, header: data.header, words: []});
			this.setState( {collections: newCollections}, this.closeModal);
		}
	}

	/**
	 * Updates an existing collection in the state's collection array with updated data.
	 * @param e SyntheticEvent
	 * @param data An object containing the data required to update the existing collection (collection object, collection index).
	 */
	editCollection(e, data)
	{
		const newCollections = this.state.collections;
		newCollections[data.index].type = data.type;
		newCollections[data.index].header = data.header;
		this.setState({collections: newCollections}, this.closeModal);
	}

	/**
	 * Removes the specified collection from the state's collection array.
	 * @param e SyntheticEvent
	 * @param collectionIndex Index of the collection to be removed.
	 */
	removeCollection(e, collectionIndex)
	{
		const newCollections = this.state.collections;
		newCollections.splice(collectionIndex, 1);
		this.setState({collections: newCollections});
	}

	/**
	 * Serialises the map to JSON then saves it in the manner specified.
	 * @param data User-specified data about the map (such as the title).
	 */
	saveMap(e, data)
	{
		const username = this.state.activeUser.username;
		const activeMapID = this.state.activeMapID;

		// Attach map data
		data.mapData = {collections: this.state.collections, journeyCount: this.state.journeyCount};

		if(data.saveMode === "Save to profile")
		{
			// Send to server
			if(activeMapID === null)
			{
				// Insert new map
				axios.put(`maps/${username}/${data}`).then((response) =>
				{
					if(this.handleResponse(response, "Map inserted.", "Map saved!"))
						this.setState({activeMapID: response.data.newMapID});
				});
			}
			else
			{
				// Update map
				axios.put(`maps/${username}/${activeMapID}/${data}`).then((response) =>
					this.handleResponse(response, "Map data updated.", "Map saved!"));
			}

		}
		else if(data.saveMode === "Export to JSON file")
		{
			// TODO: Exporting to JSON file
		}
	}

	/**
	 * Handles responses from axios calls
	 * @param response Response returned by axios call
	 * @param successMessage Success message expected from server
	 * @param successAlert Success message to display to user
	 * @returns {boolean} If the response was a success
	 */
	handleResponse(response, successMessage, successAlert)
	{
		console.log(response);
		if(response.data.type === "error")
		{
			console.error(response.data.message);
			alert(response.data.message);
		}
		else if(response.data.type === "success")
		{
			console.log(response.data);
			if(response.data.message === successMessage)
			{
				alert(successAlert);
				this.closeModal();
				return true;
			}
		}
	}

	render()
	{
		// Render any active modals and context menus
		let modalContainer = null, contextMenuContainer = null;
		if(this.state.activeModal !== null)
		{
			const activeModal = this.state.activeModal;
			modalContainer =
				<div className={"modal-container"} onClick={(e) =>{
					if(e.nativeEvent.target.className === "modal-container") this.closeModal(); // Closes modal if they click off the modal
				}}>
					{activeModal}
				</div>;
		}
		if(this.state.activeContextMenu !== null)
		{
			const activeContextMenu = this.state.activeContextMenu;
			contextMenuContainer =
				<div className={"context-menu-container"} onClick={this.closeContextMenu}>{activeContextMenu}</div>;
		}

		return (
			<div className="Lema">
				<Banner activeUser={this.state.activeUser} openModal={this.openModal} activeMapID={this.state.activeMapID}
				        authenticateUser={this.authenticateUser} registerUser={this.registerUser} saveMap={this.saveMap} />
				<div className={"main-view-container"}>
					<LeftBar collections={this.state.collections}
					         openModal={this.openModal} closeModal={this.closeModal}
					         openContextMenu={this.openContextMenu} closeContextMenu={this.closeContextMenu}
					         addNode={this.addNode} editNode={this.editNode} removeNode={this.removeNode}
					         addCollection={this.addCollection} editCollection={this.editCollection} removeCollection={this.removeCollection}
					         addJourneyFromDatabase={this.addJourneyFromDatabase}
					/>
					<Map collections={this.state.collections}
					     openContextMenu={this.openContextMenu} closeContextMenu={this.closeContextMenu}
					     openModal={this.openModal} closeModal={this.closeModal}
						 addNode={this.addNode} editNode={this.editNode} removeNode={this.removeNode}
					/>
				</div>
				{modalContainer}
				{contextMenuContainer}
			</div>
		);
	}
}

export default Lema;
