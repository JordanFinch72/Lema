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
			word: this.props.word || null,
			language: this.props.language || null
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
		if(this.state.word === null || this.state.word.length <= 0)
			errorCollector += "You must enter a word.\n";
		if(this.state.language === null || this.state.language.length <= 0)
			errorCollector += "You must enter a language.\n";

		if(errorCollector.length > 0)
		{
			alert(errorCollector); // TODO: Proper error handling with toast
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
									<LabeledControl label={"Word: "}>
										<Textbox name={"word"} value={this.state.word} hint={"e.g. \"horse from PIE to Modern English\""} onFieldChange={this.onFieldChange} />
									</LabeledControl>
									<LabeledControl label={"Language: "}>
										<Textbox hint={"e.g. \"English\""} name={"language"} value={this.state.language} onFieldChange={this.onFieldChange} />
									</LabeledControl>
									<LabeledControl label={"Type: "}>
										<select value={this.state.type} onChange={this.onFieldChange} name={"type"}>
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
								const data = {type: type, header: {word: this.state.word, language: this.state.language}, index: this.props.index};
								this.props.onCollectionSubmit(e, data);
							}
						}}/>
					</div>
				</div>
			</div>
		);
	}
}