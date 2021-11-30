import {Component} from "react";
import {Textbox} from "./Textbox";
import {Button} from "./Button";

export class AddEditNodeModal extends Component
{
	constructor(props)
	{
		super(props);
		this.state = {
			word: this.props.word || null,
			language: this.props.language || null
		};

		this.onNodeSubmit = this.props.onNodeSubmit.bind(this);
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
				<h3>Word</h3>
				<Textbox hint={"e.g. \"Horse\"..."} name={"word"} value={this.state.word} onFieldChange={this.onFieldChange}/>
				<h3>Language</h3>
				<Textbox hint={"e.g. \"English (UK)\""} name={"language"} value={this.state.language} onFieldChange={this.onFieldChange} />
				<Button value={"Submit"} id={"add-node-modal-submit"} onClick={(e) =>
				{
					let data = {word: this.state.word, language: this.state.language, parentIndex: this.props.parentIndex, childIndex: this.props.childIndex};
					this.props.onNodeSubmit(e, data);
				}}/>
			</div>
		);
	}
}