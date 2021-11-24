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
		this.updateMapMode = this.props.updateMapMode.bind(this);
	}

	onAddCollectionClick(e, data)
	{

	}

	render()
	{
		const buttons = [{active: true, label: "Cognates"}, {active: false, label: "Historical journey"}];

		return(
			<div className={"search-container"}>
				<Textbox hint={"Enter a word..."} />
				<RadioGroup buttons={buttons} name={"map-mode"} updateMapMode={this.updateMapMode} />
				<Button value={"Search"} id={"search"} />
			</div>
		)
	}
}