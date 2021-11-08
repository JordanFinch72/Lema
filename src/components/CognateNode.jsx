import {Component} from "react";

export class CognateNode extends Component
{
	constructor(props)
	{
		super(props);
		this.state = {

		};
	}

	render()
	{
		return(
			<div className={"cognate-node"}>
				{/* Flex-row */}
				<div>{this.props.word}</div>
				<div>{this.props.language}</div>
			</div>
		);
	}
}