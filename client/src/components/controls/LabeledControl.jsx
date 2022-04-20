import {Component} from "react";

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
		const label = (this.props.tooltip) ? <span title={this.props.tooltip}>{this.props.label}</span> : this.props.label;
		return(
			<div className={"labeled-control"}>
				<div className={"label"}>{label}</div>
				<div className={"control"}>
					{this.props.children}
				</div>
			</div>
		)
	}
}