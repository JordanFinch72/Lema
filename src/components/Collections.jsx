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
			collections: this.props.collections
		};

		/* Click, event handlers */
		this.cAddNode = this.cAddNode.bind(this);
		this.cAddNodeDefault = this.props.addNodeDefault.bind(this);
		this.cRemoveCollection = this.cRemoveCollection.bind(this);
	}



	/* Context menu item handlers */
	cAddNode(e, collectionIndex)
	{
		// Open the AddEditNodeModal
		this.props.openModal(e, <AddEditNodeModal onNodeSubmit={this.props.addNode} collectionIndex={collectionIndex}/>);
	}
	cAddNodeDefault(e, data)
	{
		this.props.addNodeDefault(e, data);
	}
	cRemoveCollection(e, collectionIndex)
	{
		this.props.removeCollection(e, collectionIndex);
	}


	render()
	{
		let journeys = null, cognates = null;
		let journeyCollections = [], cognateCollections = [];
		this.state.collections.map((item, index) =>
		{
			if(typeof item !== "undefined")
			{
				let component = <Collection
					key={index} index={index} type={item.type} header={item.header} openModal={this.props.openModal}
					words={item.words} editCollection={this.props.editCollection}
					openContextMenu={this.props.openContextMenu} closeContextMenu={this.props.closeContextMenu}
					cAddNode={this.cAddNode} cAddNodeDefault={this.cAddNodeDefault} cRemoveCollection={this.cRemoveCollection}
					addNode={this.props.addNode} editNode={this.props.editNode} removeNode={this.props.removeNode}
				/>;
				if(item.type === "journey")
					journeyCollections.push(component);
				else if(item.type === "cognate")
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