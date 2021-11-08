import {Component} from "react";
import {JourneyNode} from "./JourneyNode";
import {Meatballs} from "./Meatballs";
import {Collapser} from "./Collapser";

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