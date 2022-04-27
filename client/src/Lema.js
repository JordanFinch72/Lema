import "./css/Lema.css";
import {Component} from "react";
import {Banner} from "./components/Banner";
import {LeftBar} from "./components/LeftBar";
import {Map} from "./components/Map";
import axios from "axios";
import {ViewMapsModal} from "./components/modals/ViewMapsModal";

class Lema extends Component
{
	constructor(props)
	{
		super(props);

		this.state = {
			activeModal: null,       // Either null or a React component
			activeContextMenu: null, // Either null or a React component
			activeUser: null,        // Set upon user login
			activeMap: null,         // Either null, set by load function, or set by save function once saved to profile
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
		this.logoutUser = this.logoutUser.bind(this);
		this.editProfile = this.editProfile.bind(this);
		this.deleteProfile = this.deleteProfile.bind(this);
		this.newMap = this.newMap.bind(this);
		this.saveMap = this.saveMap.bind(this);
		this.loadMap = this.loadMap.bind(this);
		this.deleteMap = this.deleteMap.bind(this);
	}

	componentDidMount()
	{
		// Check if user is already logged in
		const activeUser = JSON.parse(localStorage.getItem("LEMA_activeUser"));
		if(activeUser)
			this.setState({activeUser: activeUser});

		// Check for activeMap data (mapID, title, description, isShared)
		const activeMap = JSON.parse(localStorage.getItem("LEMA_activeMap"));
		if(activeMap)
			this.setState({activeMap: activeMap});

		// Check if there are active collections (DISTINCT FROM activeMap!)
		const activeCollections = JSON.parse(localStorage.getItem("LEMA_activeCollections"));
		if(activeCollections)
			this.setState({collections: activeCollections.collections, journeyCount: activeCollections.journeyCount});
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
			{
				if(rememberMe) localStorage.setItem("LEMA_activeUser", JSON.stringify(response.data.user));
				this.setState({activeUser: response.data.user});
			}
		});

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
	}

	/**
	 * Logs the user out of the app.
	 * @param e SyntheticEvent
	 * @param forceLogout Whether the logout should be forced (when called by internal functions)
	 */
	logoutUser(e, forceLogout = false)
	{
		let userConfirmed = false;
		if(!forceLogout) userConfirmed = window.confirm("Are you sure you wish to log out? This will clear your active map data.");

		if(userConfirmed || forceLogout)
		{
			localStorage.removeItem("LEMA_activeUser");
			localStorage.removeItem("LEMA_activeMap");
			localStorage.removeItem("LEMA_activeCollections");
			this.setState({activeUser: null, activeMap: null, collections: [], journeyCount: 0});
		}
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

		this.setState({collections: newCollections, journeyCount: newJourneyCount+1}, function(){
			localStorage.setItem("LEMA_activeCollections", JSON.stringify({collections: newCollections, journeyCount: this.state.journeyCount}));
		});
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

			this.setState({collections: newCollections}, function(){
				localStorage.setItem("LEMA_activeCollections", JSON.stringify({collections: newCollections, journeyCount: this.state.journeyCount}));
				this.closeModal();
			});
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
			localStorage.setItem("LEMA_activeCollections", JSON.stringify({collections: newCollections, journeyCount: this.state.journeyCount}));
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

		this.setState({collections: newCollections}, function(){
			localStorage.setItem("LEMA_activeCollections", JSON.stringify({collections: newCollections, journeyCount: this.state.journeyCount}));
			this.closeModal();
		});
	}

	/**
	 * Adds a new collection to the state's collection array.
	 * @param e SyntheticEvent
	 * @param data An object containing the data required to build the new collection (collection object).
	 */
	addCollection(e, data)
	{
		const newCollections = this.state.collections;
		let newJourneyCount = this.state.journeyCount;

		// Only one cognate allowed, for now // TODO
		if(data.type === "cognate" && newCollections.find(e => e.type === "cognate") !== undefined)
			alert("Support for multiple cognate collections coming soon!");
		else
		{
			if(data.type === "journey")
				newJourneyCount += 1;
			newCollections.push({type: data.type, header: data.header, words: []});
			this.setState( {collections: newCollections, journeyCount: newJourneyCount}, function(){
				localStorage.setItem("LEMA_activeCollections", JSON.stringify({collections: newCollections, journeyCount: this.state.journeyCount}));
				this.closeModal();
			});
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

		this.setState({collections: newCollections}, function(){
			localStorage.setItem("LEMA_activeCollections", JSON.stringify({collections: newCollections, journeyCount: this.state.journeyCount}));
			this.closeModal();
		});
	}

	/**
	 * Removes the specified collection from the state's collection array.
	 * @param e SyntheticEvent
	 * @param collectionIndex Index of the collection to be removed.
	 */
	removeCollection(e, collectionIndex)
	{
		const newCollections = this.state.collections;
		let newJourneyCount = this.state.journeyCount;
		if(newCollections[collectionIndex].type === "journey")
			newJourneyCount = this.state.journeyCount-1;

		newCollections.splice(collectionIndex, 1); // Remove the collection

		this.setState({collections: newCollections, journeyCount: newJourneyCount}, function(){
			localStorage.setItem("LEMA_activeCollections", JSON.stringify({collections: newCollections, journeyCount: this.state.journeyCount}));
		});
	}

	/**
	 * Wipes activeMap and collections data, allowing the user to start from scratch.
	 * @param e SyntheticEvent
	 */
	newMap(e)
	{
		localStorage.removeItem("LEMA_activeMap");
		localStorage.removeItem("LEMA_activeCollections");
		this.setState({activeMap: null, collections: [], journeyCount: 0});
	}

	/**
	 * Serialises the map to JSON then saves it in the manner specified.
	 * @param data User-specified data about the map (such as the title).
	 */
	saveMap(e, data)
	{
		const username = this.state.activeUser.username;
		const activeMapID = (this.state.activeMap) ? this.state.activeMap.mapID : null;
		const isNewMap = data.isNewMap;
		console.log(data);
		console.log(this.state.activeMap);

		// Attach map data
		data.mapData = {collections: this.state.collections, journeyCount: this.state.journeyCount};

		if(data.saveMode === "Save to profile")
		{
			// Send to server
			if(activeMapID === null || isNewMap)
			{
				// Insert new map
				axios.put(`maps/${username}`, {data: data}).then((response) =>
				{
					if(this.handleResponse(response, "Map inserted.", "Map saved!"))
					{
						this.setState({activeMap: response.data.activeMap}, function(){
							localStorage.setItem("LEMA_activeMap", JSON.stringify(this.state.activeMap));
						}); // Set new map data returned by server
					}

				});
			}
			else
			{
				// Update map
				axios.put(`maps/${username}/${activeMapID}`, {data: data}).then((response) => {
					if(this.handleResponse(response, "Map data updated.", "Map saved!"))
					{
						this.setState({activeMap: response.data.activeMap}, function(){
							localStorage.setItem("LEMA_activeMap", JSON.stringify(this.state.activeMap));
						}); // Set new map data returned by server
					}

				});
			}

		}
		else if(data.saveMode === "Export to JSON file")
		{
			// Strip extraneous data
			delete data.saveMode; delete data.isNewMap; data.mapID = null;

			// Set up download
			const a = document.createElement("a");
			const blob = new Blob([JSON.stringify(data, null, 4)], {type: 'application/json'});
			a.href = URL.createObjectURL(blob);
			a.download = `map_${this.state.activeUser.username}_${data.title.replace(/\s+/g, '')}`; // File name (stripped of spaces)
			a.click(); // Download
		}
	}

	/**
	 * Loads the map using data returned by the server.
	 * @param e SyntheticEvent
	 * @param map The map object to be loaded.
	 * @param loadMode Whether the map has been loaded from the database or via user file upload.
	 */
	loadMap(e, map, loadMode)
	{
		// Build activeMap object if loaded from local file
		const activeMap = (loadMode === "database") ? map.activeMap : {
			mapID: null,
			title: map.title,
			description: map.description,
			isShared: map.isShared
		};
		this.setState({collections: []}, function(){ // Note: This is somewhat horrific, but the collections don't re-render otherwise
			this.setState({
				activeMap: activeMap,
				collections: map.mapData.collections,
				journeyCount: map.mapData.journeyCount
			}, function(){
				localStorage.setItem("LEMA_activeMap", JSON.stringify(this.state.activeMap));
				localStorage.setItem("LEMA_activeCollections", JSON.stringify({collections: this.state.collections, journeyCount: this.state.journeyCount}));
				this.closeModal();
			});
		});

	}

	deleteMap(e, mapID)
	{
		const username = this.state.activeUser.username;
		let activeMap = this.state.activeMap;

		// If they're deleting the currently active map
		if(Number(mapID) === Number(this.state.activeMap.mapID))
		{
			// Unset the activeMap
			activeMap = null;
			this.setState({activeMap: activeMap}, function(){
				localStorage.removeItem("LEMA_activeMap");
			});
		}

		// Delete the map
		axios.delete(`maps/${username}/${mapID}`).then((response) => {
			this.handleResponse(response, "Map deleted.", null, false);
			this.closeModal();
			this.openModal(e, <ViewMapsModal loadMap={this.loadMap} deleteMap={this.deleteMap} activeUser={this.state.activeUser} />);
		});
	}

	editProfile(e, data)
	{
		let activeUser = this.state.activeUser;
		const username = activeUser.username;
		axios.put(`users/${username}`, {data: data}).then((response) => {
			if(this.handleResponse(response, "User profile updated.", "Profile updated!"))
			{
				activeUser = {
					...activeUser,
					displayName: data.displayName
				};
				this.setState({activeUser: activeUser});
			}
		});
	}

	deleteProfile(e)
	{
		const username = this.state.activeUser.username;
		axios.delete(`users/${username}`).then((response) => {
			if(this.handleResponse(response, "User profile and maps deleted.", "User profile and maps deleted!"))
			{
				this.logoutUser(e, true);
			}
		});
	}

	/**
	 * Handles responses from axios calls
	 * @param response Response returned by axios call.
	 * @param successMessage Success message expected from server.
	 * @param successAlert Success message to display to user.
	 * @param closeModal Whether to close the active modal after the operation is complete.
	 * @returns {boolean} If the response was a success.
	 */
	handleResponse(response, successMessage, successAlert, closeModal = true)
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
				if(successAlert) alert(successAlert);
				if(closeModal) this.closeModal();
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
				<Banner activeUser={this.state.activeUser} openModal={this.openModal} activeMap={this.state.activeMap}
				        authenticateUser={this.authenticateUser} registerUser={this.registerUser} logoutUser={this.logoutUser}
				        editProfile={this.editProfile} deleteProfile={this.deleteProfile}
				        newMap={this.newMap} saveMap={this.saveMap} loadMap={this.loadMap} deleteMap={this.deleteMap} />
				<div className={"main-view-container"}>
					<LeftBar activeMap={this.state.activeMap} collections={this.state.collections}
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
