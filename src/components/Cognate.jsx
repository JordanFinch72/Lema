import {Component} from "react";
import {CognateNode} from "./CognateNode";
import {Meatballs} from "./Meatballs";
import {Collapser} from "./Collapser";

export class Cognate extends Component
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
			this.state.childNodes.forEach((childNode) => {
				childNodeElements.push(<CognateNode word={childNode.word} />);
			});
		}

		return(
			<div className={"cognate-container"}>
				<div className={"cognate-header"}>
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