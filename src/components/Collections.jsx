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
		};

		/* Click, event handlers */
		this.cAddNode = this.cAddNode.bind(this);
		this.cAddNodeDefault = this.cAddNodeDefault.bind(this);
		this.cRemoveCollection = this.cRemoveCollection.bind(this);
	}

	/* Context menu item handlers */
	cAddNode(e, data)
	{
		// Open the AddEditNodeModal with initial node data
		let node = {word: "", language: "", parents: []};
		if(data.type === "journey")
			node.vertex = {type: "word", customText: "", fontColour: "#000000", strokeColour: "#000000", fillColour: "#FFFFFF", radius: null, fontSize: null, x: null, y: null, edgeStart: "centre", edgeEnd: "centre", edgeStrokeColour: "#000000", edgeStrokeWidth: "2px", edgeArrowheadEnabled: true, edgeArrowheadStrokeColour: "#000000", edgeArrowheadFillColour: "#000000"};
		if(data.type === "cognate")
		{
			node.colour = "#000000";
			node.label = {type: "language", customText: "", fontColour: "#000000", fontSize: null, x: null, y: null};
		}
		this.props.openModal(e, <AddEditNodeModal words={data.words} node={node} type={data.type} onNodeSubmit={this.props.addNode} collectionIndex={data.collectionIndex}/>);
	}
	cAddNodeDefault(e, data)
	{
		// Add node with initial node data
		let node = {word: "New Word", language: "Proto-Indo-European", parents: []};
		if(data.type === "journey")
			node.vertex = {type: "word", customText: "", fontColour: "#000000", strokeColour: "#000000", fillColour: "#FFFFFF", radius: null, fontSize: null, x: null, y: null, edgeStart: "centre", edgeEnd: "centre", edgeStrokeColour: "#000000", edgeStrokeWidth: "2px", edgeArrowheadEnabled: true, edgeArrowheadStrokeColour: "#000000", edgeArrowheadFillColour: "#000000"};
		if(data.type === "cognate")
		{
			node.strokeColour = "#000000";
			node.fillColour = "#FFFFFF";
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
		let journeys = null, cognates = null;
		let journeyCollections = [], cognateCollections = [];
		this.props.collections.map((collection, index) =>
		{
			if(typeof collection !== "undefined")
			{
				let component = <Collection
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

		if(journeyCollections.length <= 0 && cognateCollections.length <= 0) // Default just say "Collections"; re-using journeys variable
		{
			journeys =
				<>
					<div className={"header-container"}>
						<h2>Collections</h2>
						<Button value={"+"} id={"manual-add"} style={{alignSelf: "end"}}
						        onClick={(e) => {
							        this.props.openModal(e, <AddEditCollectionModal onCollectionSubmit={this.props.addCollection}/>);
						        }}
						/>
					</div>
				</>;
		}
		else // Otherwise, display both "Journeys" AND "Cognates" headers so long as there is at least one of either
		{
			journeys =
				<>
					<div className={"header-container"}>
						<h2>Journeys</h2>
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
						<h2>Cognates</h2>
						<Button value={"+"} id={"manual-add"} style={{alignSelf: "end"}}
						        onClick={(e) => {
							        this.props.openModal(e, <AddEditCollectionModal onCollectionSubmit={this.props.addCollection} type={"cognate"}/>);
						        }}
						/>
					</div>
					{cognateCollections}
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