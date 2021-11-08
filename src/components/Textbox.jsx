import {Component} from "react";

export class Textbox extends Component
{
	constructor(props)
	{
		super(props);
		this.state = {
			hint: this.props.hint,
			boxValue: this.props.value || ""
		};

		this.onFieldChange = this.onFieldChange.bind(this);
	}

	onFieldChange(event)
	{
		const target = event.target;
		const name = target.name;
		let value = target.value;

		this.setState({
			[name]: value
		});
	}

	render()
	{
		return(
			<div>
				<input type={"text"} placeholder={this.state.hint} value={this.state.value} name={"boxValue"} onChange={this.onFieldChange} />
			</div>
		)
	}
}