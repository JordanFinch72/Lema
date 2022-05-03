import {Component} from "react";

class RadioButton extends Component
{
	constructor(props)
	{
		super(props);
		this.onRadioButtonClick = this.props.onRadioButtonClick.bind(this);
	}

	render()
	{
		// TODO: There's a better way to do this by having the radio button reflect the value of the state. Do it later; not a priority
		return (
			<div className={"radio-button"}>
				<input type={"radio"} id={this.props.name + this.props.id} name={this.props.name} value={this.props.label}
				       checked={this.props.active} onChange={(e) => {this.props.onRadioButtonClick(e, this.props.id)}}/>
				<label htmlFor={this.props.name + this.props.id}>{this.props.label}</label>
			</div>
		);
	}
}

export class RadioGroup extends Component
{
	constructor(props)
	{
		super(props);
		this.state = {
		};

		this.onRadioButtonClick = this.props.onRadioButtonClick.bind(this);
	}

	render()
	{
		const buttonElements = this.props.buttons.map((button, index) =>
		{
			return <RadioButton active={button.active} label={button.label} name={this.props.name} id={index}
			                    onRadioButtonClick={(e, id) => {
									this.onRadioButtonClick(e, {state: this.state, id: id}); // External handler call
								}} key={index}/>;
		});

		return (
			<div className={"radio-group"}>
				{buttonElements}
			</div>
		);
	}
}