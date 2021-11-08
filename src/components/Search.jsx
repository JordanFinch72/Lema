import {Component} from "react";
import {Textbox} from "./Textbox";
import {RadioGroup} from "./RadioGroup";

export class Search extends Component
{
	constructor(props)
	{
		super(props);
		this.state = {

		};
	}

	render()
	{
		const buttons = [{active: true, label: "Cognate mode"}, {active: false, label: "Historical journey mode"}];

		return(
			<div>
				<Textbox hint={"Enter a word..."} />
				<RadioGroup buttons={buttons} name={"map-mode"} />
			</div>
		)
	}
}