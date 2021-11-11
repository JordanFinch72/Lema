import {Component} from "react";
import {Meatballs} from "./Meatballs";
import {Collapser} from "./Collapser";

class JourneyNode extends Component
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
			<div className={"journey-node"}>
				{/* Flex-row */}
				<div>{this.props.node.word}</div>
				<div>{this.props.node.language}</div>
				<div className={"node-colour"} >
					<div style={{backgroundColor: nodeColour}} onClick={(e) => this.onNodeColourClick(e, this.props.node)}> </div>
				</div>
			</div>
		)
	}
}

export class Journey extends Component
{
	constructor(props)
	{
		super(props);
		this.state = {
			header: this.props.header || {},
			childNodes: this.props.childNodes || [],
			collapsed: false
		};

		this.toggleCollapse = this.toggleCollapse.bind(this);
		this.onNodeColourClick = this.props.onNodeColourClick.bind(this);
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
				childNodeElements.push(<JourneyNode node={childNode} key={index} onNodeColourClick={this.onNodeColourClick} />);
			});
		}

		return(
			<div className={"journey-container"}>
				<div className={"journey-header"}>
					{/* Flex-row */}
					<div>{this.state.header.word}</div>
					<div>{this.state.header.language}</div>
					<div className={"meatball-collapser-container"}>
						<Meatballs />
						<Collapser toggleCollapse={this.toggleCollapse} collapsed={this.state.collapsed} />
					</div>
				</div>
				{childNodeElements}
			</div>
		)
	}
}