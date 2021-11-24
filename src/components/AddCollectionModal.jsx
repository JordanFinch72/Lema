import {Component} from "react";
import {Textbox} from "./Textbox";
import {Button} from "./Button";

export class AddCollectionModal extends Component
{
	constructor(props)
	{
		super(props);
		this.state = {
			type: "Cognates",
			word: null,
			language: null
		};

		this.onAddCollectionSubmit = this.props.onAddCollectionSubmit.bind(this);
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
			<div className={"add-collection-modal"}>
				<h3>Collection Name (Word)</h3>
				<Textbox hint={"e.g. \"Horse\"..."} name={"word"} onFieldChange={this.onFieldChange}/>
				<h3>Collection Type</h3>
				<select value={this.state.type} onChange={this.onFieldChange} name={"type"}>
					<option>Cognates</option>
					<option>Historical journey</option>
				</select>
				<h3>Language</h3>
				<Textbox hint={"e.g. \"English (UK)\""} name={"language"} onFieldChange={this.onFieldChange} />
				<Button value={"Submit"} id={"add-collection-modal-submit"} onClick={(e) =>
				{
					let data = {type: this.state.type, header: {word: this.state.word, language: this.state.language}};
					this.props.onAddCollectionSubmit(e, data);
				}}/>
			</div>
		);
	}
}