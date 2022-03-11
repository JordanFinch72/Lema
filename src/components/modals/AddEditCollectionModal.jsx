import {Component} from "react";
import {Textbox} from "../generic/Textbox";
import {Button} from "../generic/Button";

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
	}

	onFieldChange(event)
	{
		const target = event.target;
		const name = target.name;
		let value = target.value;

		this.setState({
			[name]: value
		});
	}

	render()
	{
		return (
			<div className={"modal"}>
				<h3>Collection Name (Word)</h3>
				<Textbox hint={"e.g. \"Horse\"..."} value={this.state.word} name={"word"} onFieldChange={this.onFieldChange}/>
				<h3>Collection Type</h3>
				<select value={this.state.type} onChange={this.onFieldChange} name={"type"}>
					<option>Historical journey</option>
					<option>Cognates</option>
				</select>
				<h3>Language</h3>
				<Textbox hint={"e.g. \"English (GB)\""} name={"language"} value={this.state.language} onFieldChange={this.onFieldChange} />
				<Button value={"Submit"} id={"add-collection-modal-submit"} onClick={(e) =>
				{
					let data = {type: this.state.type, header: {word: this.state.word, language: this.state.language}, index: this.props.index};
					this.props.onCollectionSubmit(e, data);
				}}/>
			</div>
		);
	}
}