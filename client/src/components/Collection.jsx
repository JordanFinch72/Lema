import React, {Component} from "react";
import {Collapser} from "./controls/Collapser";
import {AddEditCollectionModal} from "./modals/AddEditCollectionModal";
import {AddEditNodeModal} from "./modals/AddEditNodeModal";
import {Button} from "./controls/Button";

class CollectionNode extends Component
{
	constructor(props)
	{
		super(props);
	}

	render()
	{
		const nodeColour = this.props.node.fillColour || this.props.node.vertex.fillColour; // TODO: Advanced logic for determining next unused colour (per journey)
		let changeColourTimeout;
		const collectionList = this.props.collections.filter((collection, i) => {
			if(collection.type === this.props.type)
			{
				collection.collectionIndex = i;
				return true;
			}
		})

		return (
			<div className={"collection-node"}>
				{/* Flex-row */}
				<div onClick={(e) =>
				{
					this.props.openModal(e, <AddEditNodeModal
						collectionList={collectionList}
						words={this.props.words}
						type={this.props.type}
						node={this.props.node}
						language={this.props.node.language}
						onNodeSubmit={this.props.editNode}
						collectionIndex={this.props.collectionIndex}
						createToast={this.props.createToast}
					/>);
				}}>{this.props.node.word}</div>
				<div onClick={(e) =>
				{
					this.props.openModal(e, <AddEditNodeModal
						collectionList={collectionList}
						words={this.props.words}
						type={this.props.type}
						node={this.props.node}
						language={this.props.node.language}
						onNodeSubmit={this.props.editNode}
						collectionIndex={this.props.collectionIndex}
						createToast={this.props.createToast}
					/>);
				}}>{this.props.node.language}</div>
				<div className={"buttons-container"}>
					<input type={"color"} defaultValue={nodeColour} onChange={(e) => {
						// Throttle the onChange; there's no way to have it only change when the user clicks off of it, annoyingly
						const node = this;
						window.clearTimeout(changeColourTimeout);
						changeColourTimeout = window.setTimeout(function()
						{
							const updatedNode = {
								...node.props.node
							};
							if(node.props.type === "journey")
								updatedNode.vertex.fillColour = e.target.value;
							else if(node.props.type === "cognate")
								updatedNode.fillColour = e.target.value;
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
		const wordComponents = [];
		console.log(this.props);

		if(!this.state.collapsed)
		{
			for(let i = 0; i < this.props.words.length; ++i)
			{
				wordComponents.push(<CollectionNode
					key={i}
					collections={this.props.collections}
					type={this.props.type}
					words={this.props.words}
					node={this.props.words[i]}
					editNode={this.props.editNode}
					removeNode={this.props.removeNode}
					openModal={this.props.openModal}
					collectionIndex={this.props.index}  // Index of collection the node belongs to
					createToast={this.props.createToast}
				/>);
			}
		}

		return (
			<div className={"collection-container"}>
				<div className={"collection-header"}>
					{/* Flex-row */}
					<div className={"name"} onClick={(e) =>
					{
						this.props.openModal(e, <AddEditCollectionModal
							type={this.props.type}
							name={this.props.header.name}
							onCollectionSubmit={this.props.editCollection}
							index={this.props.index}
							createToast={this.props.createToast}
						/>);
					}}>{this.props.header.name}</div>
					<div className={"meatball-collapser-container"}>
						<Button value={"+"} id={"manual-add"} style={{alignSelf: "end"}}
						        onClick={(e) => {
							        this.props.cAddNode(e, {type: this.props.type, collectionIndex: this.props.index, words: this.props.words});
						        }}
						/>
						<Button value={"X"} id={"manual-delete"} style={{alignSelf: "end"}}
						        onClick={(e) => {
									const userConfirmed = window.confirm("This will remove the entire collection of nodes from your map.\nDo you wish to continue?");
									if(userConfirmed)
							            this.props.cRemoveCollection(e, this.props.index);
						        }}
						/>
						<Collapser toggleCollapse={this.toggleCollapse} collapsed={this.state.collapsed}/>
					</div>
				</div>
				{wordComponents}
			</div>
		);
	}
}