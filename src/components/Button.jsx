import {Component} from "react";

export class Button extends Component
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
				<button>{this.props.value}</button>
			</div>
		)
	}
}