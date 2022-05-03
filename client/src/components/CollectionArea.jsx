import {Component} from "react";
import {Collection} from "./Collection";
import {Button} from "./controls/Button";
import {AddEditCollectionModal} from "./modals/AddEditCollectionModal";
import {AddEditNodeModal} from "./modals/AddEditNodeModal";
import {CommunityMap} from "./CommunityMap";
import axios from "axios";

export class CollectionArea extends Component
{
	constructor(props)
	{
		super(props);
		this.state = {
			showcaseMaps: []
		};

		/* Click, event handlers */
		this.cAddNode = this.cAddNode.bind(this);
		this.cAddNodeDefault = this.cAddNodeDefault.bind(this);
		this.cRemoveCollection = this.cRemoveCollection.bind(this);
	}

	componentDidUpdate(prevProps, prevState, snapshot)
	{
		// Retrieve shared maps
		if(this.props.isShowcaseMode && this.state.showcaseMaps.length <= 0)
		{
			axios.get(`/maps/1`).then((response) => {
				console.log(response);
				if(response.data.type === "error")
				{
					console.error(response.data.message);
					alert(response.data.message);
				}
				else if(response.data.type === "success")
				{
					console.log(response.data);
					if(response.data.message === "Maps retrieved.")
					{
						if(prevState.showcaseMaps !== response.data.maps)
							this.setState({showcaseMaps: response.data.maps}, () => console.log(this.state.showcaseMaps));
					}
				}
			});
		}
	}

	/* Context menu item handlers */
	cAddNode(e, data)
	{
		// Open the AddEditNodeModal with initial node data
		const node = {word: "", language: "", parents: []};
		if(data.type === "journey")
			node.vertex = {type: "word", customText: "", fontColour: "#000000", strokeColour: "#000000", fillColour: "#FFFFFF", radius: null, fontSize: null, x: null, y: null, edgeStart: "centre", edgeEnd: "centre", edgeStrokeColour: "#000000", edgeStrokeWidth: "2px", edgeArrowheadEnabled: true, edgeArrowheadStrokeColour: "#000000", edgeArrowheadFillColour: "#000000"};
		if(data.type === "cognate")
		{
			node.fillColour = "#FF0000"; node.strokeColour = "#000000";
			node.label = {type: "word", customText: "", fontColour: "#000000", fontSize: null, x: null, y: null};
		}
		this.props.openModal(e, <AddEditNodeModal isNewWord={true} words={data.words} node={node} type={data.type} onNodeSubmit={this.props.addNode} collectionIndex={data.collectionIndex}/>);
	}
	cAddNodeDefault(e, data)
	{
		// Add node with initial node data
		const node = {word: "New Word", language: "Proto-Indo-European", parents: []};
		if(data.type === "journey")
			node.vertex = {type: "word", customText: "", fontColour: "#000000", strokeColour: "#000000", fillColour: "#FFFFFF", radius: null, fontSize: null, x: null, y: null, edgeStart: "centre", edgeEnd: "centre", edgeStrokeColour: "#000000", edgeStrokeWidth: "2px", edgeArrowheadEnabled: true, edgeArrowheadStrokeColour: "#000000", edgeArrowheadFillColour: "#000000"};
		if(data.type === "cognate")
		{
			node.strokeColour = "#000000";
			node.fillColour = "#FF0000";
			node.label = {type: "language", customText: "", fontColour: "#000000", fontSize: null, x: null, y: null};
		}

		this.props.addNode(e, data.collectionIndex, node);
	}
	cRemoveCollection(e, collectionIndex)
	{
		this.props.removeCollection(e, collectionIndex);
	}


	render()
	{
		let journeys, cognates, header, output = [];
		const journeyCollections = [], cognateCollections = [], showcaseMaps = [];

		if(this.props.isShowcaseMode)
		{
			// Collection area header
			header = <h3>Shared Maps</h3>;

			// Add maps header to array
			showcaseMaps.push(
				<div className={"showcase-header"}>
					{/* Flex-row */}
					<div onClick={(e) =>
					{
						// TODO: Sort by title
					}}>Title</div>
					<div onClick={(e) =>
					{
						// TODO: Sort by description, I guess
					}}>Description</div>
					<div onClick={(e) =>
					{
						// TODO: Sort by... owner?
					}}>Owner</div>
				</div>
			);

			// Build list of shared maps
			console.log(this.state.showcaseMaps);
			this.state.showcaseMaps.map((map, index) =>
			{
				if(typeof map !== "undefined" && map.activeMap)
				{
					console.log(map);
					showcaseMaps.push(<CommunityMap key={index} mapID={map.activeMap.mapID} title={map.activeMap.title} description={map.activeMap.description} owner={map.activeMap.owner} />);
				}
			});

			output =
				<div className={"showcase-container"}>
					{showcaseMaps}
				</div>;
		}
		else
		{
			// Build header
			const headerText = (this.props.activeMap) ? this.props.activeMap.title : "Collection Area";
			const mapID = (this.props.activeMap) ?
				(this.props.activeMap.mapID !== null) ?
					<div className={"id"}> Attached to profile (ID: {this.props.activeMap.mapID})</div> :
					<div className={"id"}> Loaded from file or link</div>
				: "";
			header = <h3>{headerText}{mapID}</h3>;

			this.props.collections.map((collection, index) =>
			{
				if(typeof collection !== "undefined")
				{
					const component = <Collection
						collections={this.props.collections}
						key={index} index={index} type={collection.type} header={collection.header} openModal={this.props.openModal}
						words={collection.words} editCollection={this.props.editCollection}
						openContextMenu={this.props.openContextMenu} closeContextMenu={this.props.closeContextMenu}
						cAddNode={this.cAddNode} cAddNodeDefault={this.cAddNodeDefault} cRemoveCollection={this.cRemoveCollection}
						addNode={this.props.addNode} editNode={this.props.editNode} removeNode={this.props.removeNode}
					/>;
					if(collection.type === "journey")
						journeyCollections.push(component);
					else if(collection.type === "cognate")
						cognateCollections.push(component);
				}
			});

			journeys =
				<>
					<div className={"header-container"}>
						<h4>Journeys</h4>
						<Button value={"+"} id={"manual-add"} style={{alignSelf: "end"}}
						        onClick={(e) => {
							        this.props.openModal(e, <AddEditCollectionModal onCollectionSubmit={this.props.addCollection}/>);
						        }}
						/>
					</div>
					{journeyCollections}
				</>;
			cognates =
				<>
					<div className={"header-container"}>
						<h4>Cognates</h4>
						<Button value={"+"} id={"manual-add"} style={{alignSelf: "end"}}
						        onClick={(e) => {
							        if(this.props.collections)
								        this.props.openModal(e, <AddEditCollectionModal onCollectionSubmit={this.props.addCollection} type={"cognate"}/>);
						        }}
						/>
					</div>
					{cognateCollections}
				</>;

			output.push(journeys); output.push(cognates);
		}



		return (
			<div className={"collections-container"}>
				{header}
				{output}
			</div>
		);
	}
}