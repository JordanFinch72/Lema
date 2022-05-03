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
			id: (this.props.activeMap) ? this.props.activeMap.mapID : null,
			title: (this.props.activeMap) ? this.props.activeMap.title : "",
			description: (this.props.activeMap) ? this.props.activeMap.description : "",
			isShared: (this.props.activeMap) ? this.props.activeMap.isShared : false,
			saveMode: this.validSaveModes[0],
			isNewMap: false
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
			this.props.createToast(null, errorCollector, 5000, "error");
			return false;
		}
		else return true;
	}

	render()
	{
		const saveModes = [];
		this.validSaveModes.forEach((m) => saveModes.push(<option>{m}</option>));

		// Allow them to save as new map if a map is already active (loaded)
		const saveAsNewMap = (this.props.activeMap !== null && this.props.activeMap.mapID !== null) ?
			<LabeledControl label={"Save as new map:"} tooltip={"Instead of overwriting your current map in the database, it will create a new map entry."}>
				<input type={"checkbox"} name={"isNewMap"} checked={this.state.isNewMap} disabled={(this.state.saveMode !== "Save to profile")} onChange={this.onFieldChange} />
			</LabeledControl>
			: null;

		return (
			<div className={"modal"}>
				<div className={"top"}>
					<div className={"left login"}>
						<h2>Save Map</h2>
						<div className={"map-data"}>
							<div className={"section"}>
								<div className={"form"}>
									<LabeledControl label={"Title: "} hint={"e.g. \"Cool map\""} separateLine={true}>
										<Textbox name={"title"} value={this.state.title} hint={""} autoFocus={true} onFieldChange={this.onFieldChange} />
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
									{saveAsNewMap}
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className={"bottom"}>
					<div className={"buttons-container"}>
						<Button value={"Submit"} onClick={(e) =>
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