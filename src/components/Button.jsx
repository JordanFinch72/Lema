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
			<div className={"button"}>
				<button id={this.props.id}>{this.props.value}</button>
			</div>
		)
	}
}