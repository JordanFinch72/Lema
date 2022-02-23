import {Component} from "react";

class RadioButton extends Component
{
	constructor(props)
	{
		super(props);
		this.onButtonClick = this.props.onButtonClick.bind(this);
	}

	render()
	{
		// TODO: There's a better way to do this by having the radio button reflect the value of the state. Do it later; not a priority
		return (
			<div className={"radio-button"}>
				<input type={"radio"} id={this.props.name + this.props.id} name={this.props.name} value={this.props.label}
				       checked={this.props.active} onChange={(e) => {this.props.onButtonClick(e, this.props.id)}}/>
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
			buttons: this.props.buttons,
			name: this.props.name
		};

		this.onButtonClick = this.props.onButtonClick.bind(this);
	}

	updateGroup(id)
	{
		// Update the state of the buttons
		let oldButtons = this.state.buttons;
		for(let i = 0; i < oldButtons.length; ++i)
		{
			oldButtons[i].active = (i === id);
		}
		this.setState({buttons: oldButtons});
	}

	render()
	{
		let buttonElements = this.state.buttons.map((button, index) =>
		{
			return <RadioButton active={button.active} label={button.label} name={this.props.name} id={index}
			                    onButtonClick={(e, id) => {
									this.updateGroup(id); // Internal RadioGroup state update
									this.onButtonClick(e, {state: this.state, id: id}); // External handler call
								}} key={index}/>;
		});

		return (
			<div className={"radio-group"}>
				{buttonElements}
			</div>
		);
	}
}