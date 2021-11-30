import {Component} from "react";
import {Meatballs} from "./Meatballs";
import {Collapser} from "./Collapser";

class CollectionNode extends Component
{
	constructor(props)
	{
		super(props);
		this.onNodeColourClick = this.props.onNodeColourClick.bind(this);
	}

	render()
	{
			let nodeColour = this.props.node.colour || "blue"; // TODO: Advanced logic for determining next unused colour (per journey)

		return(
			<div className={"collection-node"}>
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
			type: this.props.type || "journey",
			header: this.props.header || {},
			childNodes: this.props.childNodes || [],
			collapsed: false
		};

		this.toggleCollapse = this.toggleCollapse.bind(this);
		this.onNodeColourClick = this.props.onNodeColourClick.bind(this);
		this.openContextMenu = this.props.openContextMenu.bind(this);
		this.closeContextMenu = this.props.closeContextMenu.bind(this);
		this.addNodeHandler = this.props.addNodeHandler.bind(this);
		this.addNodeDefaultHandler = this.props.addNodeDefaultHandler.bind(this);
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
			this.state.childNodes.map((childNode, index) => {
				childNodeElements.push(<CollectionNode type={this.state.type} node={childNode} key={index} onNodeColourClick={this.onNodeColourClick} />);
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
					<div>{this.state.header.word}</div>
					<div>{this.state.header.language}</div>
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