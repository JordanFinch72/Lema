import {Component} from "react";
import {Meatballs} from "./Meatballs";
import {Collapser} from "./Collapser";
import {AddEditCollectionModal} from "./AddEditCollectionModal";
import {AddEditNodeModal} from "./AddEditNodeModal";
import {Button} from "./Button";

class CollectionNode extends Component
{
	constructor(props)
	{
		super(props);
		this.openModal = this.props.openModal.bind(this);
		this.editNodeColour = this.props.editNodeColour.bind(this);
		this.editNode = this.props.editNode.bind(this);
		this.removeNode = this.props.removeNode.bind(this);
	}

	render()
	{
		let nodeColour = this.props.node.colour || "blue"; // TODO: Advanced logic for determining next unused colour (per journey)
		let changeColourTimeout;

		return (
			<div className={"collection-node"}>
				{/* Flex-row */}
				<div onClick={(e) =>
				{
					this.openModal(e, <AddEditNodeModal
						word={this.props.node.word}
						language={this.props.node.language}
						onNodeSubmit={this.props.editNode}
						parentIndex={this.props.parentIndex}
						childIndex={this.props.childIndex}
					/>);
				}}>{this.props.node.word}</div>
				<div onClick={(e) =>
				{
					this.openModal(e, <AddEditNodeModal
						word={this.props.node.word}
						language={this.props.node.language}
						onNodeSubmit={this.props.editNode}
						parentIndex={this.props.parentIndex}
						childIndex={this.props.childIndex}
					/>);
				}}>{this.props.node.language}</div>
				<div className={"buttons-container"}>
					<input type={"color"} defaultValue={this.props.node.colour} onChange={(e) => {
						// Throttle the onChange; there's no way to have it only change when the user clicks off of it, annoyingly
						let node = this;
						window.clearTimeout(changeColourTimeout);
						changeColourTimeout = window.setTimeout(function()
						{
							node.editNodeColour(e, node.props.parentIndex, node.props.childIndex, e.target.value);
						}, 100);
					}}/>
					<Button value={"X"} id={"remove-node"}
					        onClick={(e) => this.removeNode(e, this.props.parentIndex, this.props.childIndex)}/>
				</div>
			</div>
		);
	}
}

export class Collection extends Component
{
	constructor(props)
	{
		super(props);
		this.state = {
			collapsed: false // Note: Could be lifted if we want persistence when editing types
		};

		this.toggleCollapse = this.toggleCollapse.bind(this);

		this.openContextMenu = this.props.openContextMenu.bind(this);
		this.closeContextMenu = this.props.closeContextMenu.bind(this);
		this.openModal = this.props.openModal.bind(this);
		this.cAddNode = this.props.cAddNode.bind(this);
		this.cAddNodeDefault = this.props.cAddNodeDefault.bind(this);
		this.cRemoveCollection = this.props.cRemoveCollection.bind(this);
		this.editCollection = this.props.editCollection.bind(this);
		this.addNode = this.props.addNode.bind(this);
		this.editNode = this.props.editNode.bind(this);
		this.editNodeColour = this.props.editNodeColour.bind(this);
		this.removeNode = this.props.removeNode.bind(this);
	}

	toggleCollapse(e)
	{
		this.setState({collapsed: !this.state.collapsed});
	}

	render()
	{
		let childNodeElements = [];

		if(!this.state.collapsed)
		{
			this.props.childNodes.map((childNode, index) =>
			{
				childNodeElements.push(<CollectionNode
					key={index}  type={this.props.type} node={childNode}
					editNode={this.editNode}
					editNodeColour={this.editNodeColour}
					removeNode={this.removeNode}
					openModal={this.openModal}
					parentIndex={this.props.index} // Index of Collection the child node belongs to
					childIndex={index}             // Index of child node itself within childNodes array
				/>);
			});
		}

		let meatballItems = [
			{
				text: "Add node", handler: (e) =>
				{
					this.cAddNode(e, this.props.index);
				}
			},
			{
				text: "Add node (default)", handler: (e) =>
				{
					this.cAddNodeDefault(e, this.props.index);
				}
			},
			{
				text: "Remove collection", handler: (e) =>
				{
					this.cRemoveCollection(e, this.props.index);
				}
			}
		];

		return (
			<div className={"collection-container"}>
				<div className={"collection-header"}>
					{/* Flex-row */}
					<div onClick={(e) =>
					{
						this.openModal(e, <AddEditCollectionModal
							type={this.props.type}
							word={this.props.header.word}
							language={this.props.header.language}
							onCollectionSubmit={this.editCollection}
							index={this.props.index}
						/>);
					}}>{this.props.header.word}</div>
					<div onClick={(e) =>
					{
						this.openModal(e, <AddEditCollectionModal
							type={this.props.type}
							word={this.props.header.word}
							language={this.props.header.language}
							onCollectionSubmit={this.editCollection}
							index={this.props.index}
						/>);
					}}>{this.props.header.language}</div>
					<div className={"meatball-collapser-container"}>
						<Meatballs openModal={this.openModal} openContextMenu={this.openContextMenu}
						           closeContextMenu={this.closeContextMenu} contextMenuItems={meatballItems}/>
						<Collapser toggleCollapse={this.toggleCollapse} collapsed={this.state.collapsed}/>
					</div>
				</div>
				{childNodeElements}
			</div>
		);
	}
}