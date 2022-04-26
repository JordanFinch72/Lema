import {Component} from "react";

export class Textbox extends Component
{
	constructor(props)
	{
		super(props);
		this.state = {
			hint: this.props.hint,
			name: this.props.name || this.props.value || "",
			type: (this.props.isPassword) ? "password" : "text",
		};

		if(this.props.onFieldChange)
			this.onFieldChange = this.props.onFieldChange.bind(this);
		else
			this.onFieldChange = this.onFieldChange.bind(this);
	}

	onFieldChange(event)
	{
		const target = event.target;
		const name = target.name;
		const value = target.value;

		this.setState({
			[name]: value
		});
	}

	render()
	{
		return(
			<div className={"textbox"}>
				<input type={this.state.type} placeholder={this.state.hint} value={this.props.value} name={this.props.name} autoComplete={"off"} autoFocus={this.props.autoFocus} onChange={this.onFieldChange} />
			</div>
		)
	}
}