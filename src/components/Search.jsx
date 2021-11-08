import {Component} from "react";
import {Textbox} from "./Textbox";
import {RadioGroup} from "./RadioGroup";
import {Button} from "./Button";

export class Search extends Component
{
	constructor(props)
	{
		super(props);
		this.state = {

		};
		this.updateMapMode = this.props.updateMapMode.bind(this);
	}

	render()
	{
		const buttons = [{active: true, label: "Cognate mode"}, {active: false, label: "Historical journey mode"}];

		return(
			<div>
				<Textbox hint={"Enter a word..."} />
				<RadioGroup buttons={buttons} name={"map-mode"} updateMapMode={this.updateMapMode} />
				<Button value={"Search"} />
			</div>
		)
	}
}