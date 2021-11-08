import {Component} from "react";
import {RadioButton} from "./RadioButton";

export class RadioGroup extends Component
{
	constructor(props)
	{
		super(props);
		this.state = {
			buttons: this.props.buttons,
			name: this.props.name
		};

		this.onButtonClick = this.onButtonClick.bind(this);
		this.updateMapMode = this.props.updateMapMode.bind(this);
	}

	onButtonClick(e, id)
	{
		// Update the state of the buttons
		let oldButtons = this.state.buttons;
		for(let i = 0; i < oldButtons.length; ++i)
		{
			oldButtons[i].active = (i === id);
		}
		this.setState({buttons: oldButtons});

		// Update parent LeftBar component's state
		let mode = (id === 0) ? "cognate" : "journey";
		this.updateMapMode(e, mode);
	}

	render()
	{
		let buttonElements = [];

		let i = 0;
		this.state.buttons.forEach((button) => {
			buttonElements.push(
				<RadioButton active={button.active} label={button.label} name={this.state.name} id={i} onButtonClick={this.onButtonClick} />
			);
			++i;
		});

		return(
			<div>
				{buttonElements}
			</div>
		)
	}
}