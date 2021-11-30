import {Component} from "react";
import {Textbox} from "./Textbox";
import {Button} from "./Button";

export class AddNodeModal extends Component
{
	constructor(props)
	{
		super(props);
		this.state = {
			word: null,
			language: null
		};

		this.onAddNodeSubmit = this.props.onAddNodeSubmit.bind(this);
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
				<Textbox hint={"e.g. \"Horse\"..."} name={"word"} onFieldChange={this.onFieldChange}/>
				<h3>Language</h3>
				<Textbox hint={"e.g. \"English (UK)\""} name={"language"} onFieldChange={this.onFieldChange} />
				<Button value={"Submit"} id={"add-node-modal-submit"} onClick={(e) =>
				{
					let data = {word: this.state.word, language: this.state.language, parent: this.props.parent};
					this.props.onAddNodeSubmit(e, data);
				}}/>
			</div>
		);
	}
}