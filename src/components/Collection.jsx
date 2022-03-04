import React, {Component} from "react";
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
	}

	render()
	{
		let nodeColour = this.props.node.colour || this.props.node.vertex.fillColour; // TODO: Advanced logic for determining next unused colour (per journey)
		let changeColourTimeout;

		return (
			<div className={"collection-node"}>
				{/* Flex-row */}
				<div onClick={(e) =>
				{
					this.props.openModal(e, <AddEditNodeModal
						words={this.props.words}
						type={this.props.type}
						node={this.props.node}
						language={this.props.node.language}
						onNodeSubmit={this.props.editNode}
						collectionIndex={this.props.collectionIndex}
					/>);
				}}>{this.props.node.word}</div>
				<div onClick={(e) =>
				{
					this.props.openModal(e, <AddEditNodeModal
						words={this.props.words}
						type={this.props.type}
						node={this.props.node}
						language={this.props.node.language}
						onNodeSubmit={this.props.editNode}
						collectionIndex={this.props.collectionIndex}
					/>);
				}}>{this.props.node.language}</div>
				<div className={"buttons-container"}>
					<input type={"color"} defaultValue={nodeColour} onChange={(e) => {
						// Throttle the onChange; there's no way to have it only change when the user clicks off of it, annoyingly
						let node = this;
						window.clearTimeout(changeColourTimeout);
						changeColourTimeout = window.setTimeout(function()
						{
							let updatedNode = {
								...node.props.node
							};
							if(node.props.type === "journey")
								updatedNode.vertex.fillColour = e.target.value;
							else if(node.props.type === "cognate")
								updatedNode.colour = e.target.value;
							node.props.editNode(e, node.props.collectionIndex, updatedNode);
						}, 100);
					}}/>
					<Button value={"X"} id={"remove-node"}
					        onClick={(e) => this.props.removeNode(e, this.props.collectionIndex, this.props.node.arrayIndex)}/>
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
			collapsed: false, // Note: Could be lifted if we want persistence when editing types
		};

		this.toggleCollapse = this.toggleCollapse.bind(this);
	}

	toggleCollapse(e)
	{
		this.setState({collapsed: !this.state.collapsed});
	}

	render()
	{
		let wordComponents = [];
		console.log(this.props);

		if(!this.state.collapsed)
		{
			for(let i = 0; i < this.props.words.length; ++i)
			{
				wordComponents.push(<CollectionNode
					key={i}
					type={this.props.type}
					flatCollection={this.flatCollection}
					words={this.props.words}
					node={this.props.words[i]}
					editNode={this.props.editNode}
					removeNode={this.props.removeNode}
					openModal={this.props.openModal}
					collectionIndex={this.props.index}  // Index of collection the node belongs to
				/>);
			}
		}

		let meatballItems = [
			{
				text: "Add node", handler: (e) =>
				{
					this.props.cAddNode(e, {type: this.props.type, collectionIndex: this.props.index, words: this.props.words});
				}
			},
			{
				text: "Add node (default)", handler: (e) =>
				{
					this.props.cAddNodeDefault(e, {type: this.props.type, collectionIndex: this.props.index});
				}
			},
			{
				text: "Remove collection", handler: (e) =>
				{
					this.props.cRemoveCollection(e, this.props.index);
				}
			}
		];

		return (
			<div className={"collection-container"}>
				<div className={"collection-header"}>
					{/* Flex-row */}
					<div onClick={(e) =>
					{
						this.props.openModal(e, <AddEditCollectionModal
							type={this.props.type}
							word={this.props.header.word}
							language={this.props.header.language}
							onCollectionSubmit={this.props.editCollection}
							index={this.props.index}
						/>);
					}}>{this.props.header.word}</div>
					<div onClick={(e) =>
					{
						this.props.openModal(e, <AddEditCollectionModal
							type={this.props.type}
							word={this.props.header.word}
							language={this.props.header.language}
							onCollectionSubmit={this.props.editCollection}
							index={this.props.index}
						/>);
					}}>{this.props.header.language}</div>
					<div className={"meatball-collapser-container"}>
						<Meatballs openModal={this.props.openModal} openContextMenu={this.props.openContextMenu}
						           closeContextMenu={this.props.closeContextMenu} contextMenuItems={meatballItems}/>
						<Collapser toggleCollapse={this.toggleCollapse} collapsed={this.state.collapsed}/>
					</div>
				</div>
				{wordComponents}
			</div>
		);
	}
}