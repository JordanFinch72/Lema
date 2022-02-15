import {Component} from "react";
import {Textbox} from "./Textbox";
import {RadioGroup} from "./RadioGroup";
import {Button} from "./Button";

export class ControlBox extends Component
{
	constructor(props)
	{
		super(props);
		this.state = {

		};

		this.onButtonClick = this.onButtonClick.bind(this);
		this.updateMapMode = this.props.updateMapMode.bind(this);
	}

	onButtonClick(e, data)
	{
		// Update parent LeftBar component's state
		let mode = (data.id === 0) ? "journey" : "cognate";
		this.updateMapMode(e, mode);
	}

	render()
	{
		const buttons = [{active: false, label: "Historical journey"}, {active: true, label: "Cognates"}];

		return(
			<div className={"search-container"}>
				<Textbox hint={"Enter a word..."} />
				<RadioGroup buttons={buttons} name={"map-mode"} onButtonClick={this.onButtonClick} />
				<Button value={"Search"} id={"search"} />
			</div>
		)
	}
}