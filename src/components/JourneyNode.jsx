import {Component} from "react";

export class JourneyNode extends Component
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
			<div className={"journey-node"}>
				{/* Flex-row */}
				<div>{this.props.word}</div>
				<div>{this.props.language}</div>
			</div>
		)
	}
}