import {Component} from "react";
import {Textbox} from "./Textbox";

export class LabeledControl extends Component
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
			<div className={"labeled-control"}>
				<div className={"label"}>{this.props.label} </div>
				<div className={"control"}>
					{this.props.children}
				</div>
			</div>
		)
	}
}