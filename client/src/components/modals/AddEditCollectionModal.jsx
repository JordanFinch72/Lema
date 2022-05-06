import {Component} from "react";
import {Textbox} from "../controls/Textbox";
import {Button} from "../controls/Button";
import {LabeledControl} from "../controls/LabeledControl";
import {ColourPicker} from "../controls/ColourPicker";

export class AddEditCollectionModal extends Component
{
	constructor(props)
	{
		super(props);
		this.state = {
			type: (this.props.type === "cognate") ? "Cognates" : "Historical journey",
			name: this.props.name || null
		};

		this.onCollectionSubmit = this.props.onCollectionSubmit.bind(this);
		this.onFieldChange = this.onFieldChange.bind(this);
		this.validation = this.validation.bind(this);
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

	validation()
	{
		// Data validation
		// TODO: For cognates, only one cognate per language should be allowed
		//  - Future feature: for additional cognate collections, change solid colours to patterns of the specified colours instead (e.g. stripes; checks)
		let errorCollector = "";
		if(this.state.name === null || this.state.name.length <= 0)
			errorCollector += "You must enter a name.\n";

		if(errorCollector.length > 0)
		{
			this.props.createToast(null, errorCollector, 5000, "error");
			return false;
		}
		else return true;
	}

	render()
	{
		return (
			<div className={"modal"}>
				<div className={"top"}>
					<div className={"left"}>
						<h2>New Collection</h2>
						<div className={"node-data"}>
							<div className={"section"}>
								<div className={"form"}>
									<LabeledControl label={"Name: "}>
										<Textbox name={"name"} value={this.state.name} hint={"e.g. \"horse (PIE->English)\""} autoFocus={true} onFieldChange={this.onFieldChange} />
									</LabeledControl>
									<LabeledControl label={"Type: "}>
										<select name={"type"} value={this.state.type} onChange={this.onFieldChange}>
											<option>Historical journey</option>
											<option>Cognates</option>
										</select>
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
							if(this.validation())
							{
								const type = (this.state.type === "Historical journey") ? "journey" : "cognate";
								const data = {type: type, header: {name: this.state.name}, index: this.props.index};
								this.props.onCollectionSubmit(e, data);
							}
						}}/>
					</div>
				</div>
			</div>
		);
	}
}