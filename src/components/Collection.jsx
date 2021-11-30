import {Component} from "react";
import {Meatballs} from "./Meatballs";
import {Collapser} from "./Collapser";
import {AddEditCollectionModal} from "./AddEditCollectionModal";
import {AddEditNodeModal} from "./AddEditNodeModal";

class CollectionNode extends Component
{
	constructor(props)
	{
		super(props);
		this.openModal = this.props.openModal.bind(this);
		this.onNodeColourClick = this.props.onNodeColourClick.bind(this);
		this.onEditNodeSubmit = this.props.onEditNodeSubmit.bind(this);
	}

	render()
	{
		let nodeColour = this.props.node.colour || "blue"; // TODO: Advanced logic for determining next unused colour (per journey)

		return(
			<div className={"collection-node"} onClick={(e) => {
				this.openModal(e, <AddEditNodeModal
					word={this.props.node.word}
					language={this.props.node.language}
					onNodeSubmit={this.props.onEditNodeSubmit}
					parentIndex={this.props.parentIndex}
					childIndex={this.props.childIndex}
				/>);
			}}>
				{/* Flex-row */}
				<div>{this.props.node.word}</div>
				<div>{this.props.node.language}</div>
				<div className={"node-colour"} >
					<input type={"color"} onChange={(e) => console.log(e)} />
				</div>
			</div>
		)
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
		this.onNodeColourClick = this.props.onNodeColourClick.bind(this);
		this.openContextMenu = this.props.openContextMenu.bind(this);
		this.closeContextMenu = this.props.closeContextMenu.bind(this);
		this.openModal = this.props.openModal.bind(this);
		this.addNodeHandler = this.props.addNodeHandler.bind(this);
		this.addNodeDefaultHandler = this.props.addNodeDefaultHandler.bind(this);
		this.onEditCollectionSubmit = this.props.onEditCollectionSubmit.bind(this);
		this.onAddNodeSubmit = this.props.onAddNodeSubmit.bind(this);
		this.onEditNodeSubmit = this.props.onEditNodeSubmit.bind(this);
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
			this.props.childNodes.map((childNode, index) => {
				childNodeElements.push(<CollectionNode
					key={index} type={this.props.type} node={childNode}
					onEditNodeSubmit={this.onEditNodeSubmit}
					onNodeColourClick={this.onNodeColourClick}
					openModal={this.openModal}
					parentIndex={this.props.index} // Index of Collection the child node belongs to
					childIndex={index}             // Index of child node itself within childNodes array
				/>);
			});
		}

		let meatballItems = [
			{text: "Add node", handler: (e) => {this.addNodeHandler(e, this.props.index)}},
			{text: "Add node (default)", handler: (e) => {this.addNodeDefaultHandler(e, this.props.index)}}
		];

		return(
			<div className={"collection-container"}>
				<div className={"collection-header"}>
					{/* Flex-row */}
					<div onClick={(e) => {
						this.openModal(e, <AddEditCollectionModal
							type={this.props.type}
							word={this.props.header.word}
							language={this.props.header.language}
							onCollectionSubmit={this.onEditCollectionSubmit}
							index={this.props.index}
						/>);
					}}>{this.props.header.word}</div>
					<div onClick={(e) => {
						this.openModal(e, <AddEditCollectionModal
							type={this.props.type}
							word={this.props.header.word}
							language={this.props.header.language}
							onCollectionSubmit={this.onEditCollectionSubmit}
							index={this.props.index}
						/>);
					}}>{this.props.header.language}</div>
					<div className={"meatball-collapser-container"}>
						<Meatballs openModal={this.openModal} openContextMenu={this.openContextMenu} closeContextMenu={this.closeContextMenu} contextMenuItems={meatballItems} />
						<Collapser toggleCollapse={this.toggleCollapse} collapsed={this.state.collapsed} />
					</div>
				</div>
				{childNodeElements}
			</div>
		)
	}
}