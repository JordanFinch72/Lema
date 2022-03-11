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
		const className = "button" + ((this.props.disabled) ? " disabled" : "");
		const onClick = (this.props.disabled) ? null : this.props.onClick; // To prevent it from being clickable even if they remove the "disabled" attribute in inspect element
		return(
			<div className={className}>
				<button name={this.props.name} disabled={this.props.disabled} id={this.props.id} onClick={onClick}>{this.props.value}</button>
			</div>
		)
	}
}