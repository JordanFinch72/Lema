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
			<div>
				<p>{this.props.word}</p>
			</div>
		)
	}
}