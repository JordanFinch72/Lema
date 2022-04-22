import {Component} from "react";
import {Textbox} from "../controls/Textbox";
import {Button} from "../controls/Button";
import {LabeledControl} from "../controls/LabeledControl";

export class SaveModal extends Component
{
	constructor(props)
	{
		super(props);

		this.validSaveModes = ["Save to profile", "Export to JSON file"];

		this.state = {
			id: this.props.activeMapID || null,
			title: "",
			description: "",
			saveMode: this.validSaveModes[0],
			isShared: false
		};

		this.onFieldChange = this.onFieldChange.bind(this);
	}

	onFieldChange(event)
	{
		const target = event.target;
		const name = target.name;
		const value = (target.type === "checkbox") ? target.checked : target.value;

		this.setState({
			[name]: value
		});
	}

	/**
	 * Validates form data.
	 * @param mode Whether to validate login or register data
	 * @returns {boolean}
	 */
	validate()
	{
		let errorCollector = "";
		if(this.state.title === "")
			errorCollector += "Maps must have a title.\n";
		if(!this.validSaveModes.includes(this.state.saveMode))
			errorCollector += "Invalid save mode.\n";

		if(errorCollector !== "")
		{
			alert(errorCollector);
			return false;
		}
		else return true;
	}

	render()
	{
		const saveModes = [];
		this.validSaveModes.forEach((m) => saveModes.push(<option>{m}</option>));

		return (
			<div className={"modal"}>
				<div className={"top"}>
					<div className={"left login"}>
						<h2>Save Map</h2>
						<div className={"map-data"}>
							<div className={"section"}>
								<div className={"form"}>
									<LabeledControl label={"Title: "} hint={"e.g. \"Cool map\""} separateLine={true}>
										<Textbox name={"title"} value={this.state.title} hint={""} onFieldChange={this.onFieldChange} />
									</LabeledControl>
									<LabeledControl label={"Description: "} hint={"e.g. \"Map of cool connections\""} separateLine={true}>
										<Textbox name={"description"} value={this.state.description} hint={""} onFieldChange={this.onFieldChange} />
									</LabeledControl>
									<LabeledControl label={"Save mode: "} separateLine={true}>
										<select name={"saveMode"} value={this.state.saveMode} onChange={this.onFieldChange}>
											{saveModes}
										</select>
									</LabeledControl>
									<LabeledControl label={"Share to showcase:"} tooltip={"This will make your map visible to others on the Community Showcase page."}>
										<input type={"checkbox"} name={"isShared"} checked={this.state.isShared} disabled={(this.state.saveMode !== "Save to profile")} onChange={this.onFieldChange} />
									</LabeledControl>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className={"bottom"}>
					<div className={"buttons-container"}>
						<Button value={"Submit"} id={"add-collection-modal-submit"} onClick={(e) =>
						{
							if(this.validate())
							{
								this.props.handler(e, this.state);
							}
						}}/>
					</div>
				</div>
			</div>
		);
	}
}