import {Component} from "react";

export class RadioButton extends Component
{
	constructor(props)
	{
		super(props);
		this.onButtonClick = this.props.onButtonClick.bind(this);
	}

	render()
	{
		// TODO: There's a better way to do this by having the radio button reflect the value of the state. Do it later; not a priority
		return(
			<div>
				<input type={"radio"} id={this.props.id} name={this.props.name} value={this.props.label} checked={this.props.active} onChange={(e) => this.onButtonClick(e, this.props.id)} />
				<label htmlFor={this.props.id}>{this.props.label}</label>
			</div>
		)
	}
}