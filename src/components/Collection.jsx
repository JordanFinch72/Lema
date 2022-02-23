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
					this.props.openModal(e, <AddEditNodeModal
						type={this.props.type}
						node={this.props.node}
						language={this.props.node.language}
						onNodeSubmit={this.props.editNode}
						collectionIndex={this.props.collectionIndex}
						indexChain={this.props.indexChain}
					/>);
				}}>{this.props.node.word}</div>
				<div onClick={(e) =>
				{
					this.props.openModal(e, <AddEditNodeModal
						type={this.props.type}
						node={this.props.node}
						language={this.props.node.language}
						onNodeSubmit={this.props.editNode}
						collectionIndex={this.props.collectionIndex}
						indexChain={this.props.indexChain}
					/>);
				}}>{this.props.node.language}</div>
				<div className={"buttons-container"}>
					<input type={"color"} defaultValue={this.props.node.colour} onChange={(e) => {
						// Throttle the onChange; there's no way to have it only change when the user clicks off of it, annoyingly
						let node = this;
						window.clearTimeout(changeColourTimeout);
						changeColourTimeout = window.setTimeout(function()
						{
							let data = {collectionIndex: node.props.collectionIndex, indexChain: node.props.indexChain, node: {
								...node,
									colour: e.target.value
								}};
							node.props.editNode(e, data);
						}, 100);
					}}/>
					<Button value={"X"} id={"remove-node"}
					        onClick={(e) => this.props.removeNode(e, this.props.collectionIndex, this.props.wordIndex)}/>
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
		this.getCollectionWords = this.getCollectionWords.bind(this);
	}

	toggleCollapse(e)
	{
		this.setState({collapsed: !this.state.collapsed});
	}


	/**
	 * Recursive algorithm that adds a CollectionNode component for each word in a collection
	 * @param {*} wordComponents An initially empty array that contains the CollectionNode components
	 * @param {*} node The currently worked-on node for this depth level
	 * @param {number} i The index of the currently worked-on node
	 * @param {string} indexChain The chain of indexes required to get to the node (e.g. this.props.words[0].parents[1].parents[4] would have a chain of 0,1,4)
	 * @param {string} collectionIndex The index of the collection that the node belongs to
	 */
	getCollectionWords(wordComponents, node, i, indexChain, collectionIndex)
	{
		indexChain += String(i);
		if(node.parents)
		{
			for(let j = 0; j < node.parents.length; ++j)
			{
				wordComponents = this.getCollectionWords(wordComponents, node.parents[j], j, indexChain + "->", collectionIndex);
			}
		}

		//indexChain = indexChain.slice(2, indexChain.length); // Clip initial "->"
		wordComponents.push(<CollectionNode
			key={indexChain}
			type={this.props.type}
			node={node}
			editNode={this.props.editNode}
			removeNode={this.props.removeNode}
			openModal={this.props.openModal}
			collectionIndex={collectionIndex}  // Index of collection the node belongs to
			indexChain={indexChain}            // Index chain pointing to word in the tree
		/>);

		return wordComponents;
	}

	render()
	{
		let wordComponents = []; // All word ele

		if(!this.state.collapsed)
		{
			if(this.props.words.length > 0)
				wordComponents = this.getCollectionWords(wordComponents, this.props.words[0], 0, "", this.props.index);
		}

		let meatballItems = [
			{
				text: "Add node", handler: (e) =>
				{
					this.props.cAddNode(e, this.props.index);
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
						this.openModal(e, <AddEditCollectionModal
							type={this.props.type}
							word={this.props.header.word}
							language={this.props.header.language}
							onCollectionSubmit={this.props.editCollection}
							index={this.props.index}
						/>);
					}}>{this.props.header.word}</div>
					<div onClick={(e) =>
					{
						this.openModal(e, <AddEditCollectionModal
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