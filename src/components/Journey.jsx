import {Component} from "react";
import {Meatballs} from "./Meatballs";
import {Collapser} from "./Collapser";

class JourneyNode extends Component
{
	constructor(props)
	{
		super(props);
		this.state = {
			nodeColour: "blue"
		};

		this.onNodeColourClick = this.onNodeColourClick.bind(this);
	}

	/**
	 * Open a modal that allows user to change the colour of the node on the map
	 */
	onNodeColourClick()
	{
		// TODO: Open modal, allow user choice
		let newValue = "red";
		this.setState({nodeColour: newValue});
	}

	render()
	{
		return(
			<div className={"journey-node"}>
				{/* Flex-row */}
				<div>{this.props.word}</div>
				<div>{this.props.language}</div>
				<div className={"node-colour"} style={"background-color: " + this.state.nodeColour} onClick={this.onNodeColourClick}> </div>
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
				childNodeElements.push(<JourneyNode word={childNode.word} key={index} />);
			});
		}

		return(
			<div className={"journey-container"}>
				<div className={"journey-header"}>
					{/* Flex-row */}
					<div>{this.state.header.word}</div>
					<div>{this.state.header.language}</div>
					<Meatballs />
					<Collapser toggleCollapse={this.toggleCollapse} collapsed={this.state.collapsed} />
				</div>
				{childNodeElements}
			</div>
		)
	}
}