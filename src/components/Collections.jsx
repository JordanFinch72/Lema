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
			items: this.props.items
		};

		/* Click, event handlers */
		this.addCollection = this.props.addCollection.bind(this);
		this.editCollection = this.props.editCollection.bind(this);
		this.addNode = this.props.addNode.bind(this);
		this.editNode = this.props.editNode.bind(this);
		this.editNodeColour = this.props.editNodeColour.bind(this);
		this.removeNode = this.props.removeNode.bind(this);
		this.cAddNode = this.cAddNode.bind(this);
		this.cAddNodeDefault = this.cAddNodeDefault.bind(this);
		this.cRemoveCollection = this.cRemoveCollection.bind(this);

		/* Prop functions */
		this.openModal = this.props.openModal.bind(this);
		this.closeModal = this.props.closeModal.bind(this);
		this.openContextMenu = this.props.openContextMenu.bind(this);
		this.closeContextMenu = this.props.closeContextMenu.bind(this);
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