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
			language: (typeof this.props.language === "object") ? this.props.language[0] : this.props.language,
			collection: (this.props.collectionList)
				? (`${this.props.collectionList[0].type[0].toUpperCase() + this.props.collectionList[0].type.substring(1)}: ${this.props.collectionList[0].header.word}`) : null
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
		// Languages is a textbox if none or one language is supplied, or a drop-down menu if some are supplied
		let languageInput;
		if(typeof this.props.language === "object")
		{
			let options = [];
			for(let i = 0; i < this.props.language.length; ++i)
			{
				options.push(<option key={i}>{this.props.language[i]}</option>);
			}
			languageInput = <select name={"language"} value={this.state.language} onChange={this.onFieldChange}>
				{options}
			</select>
		}
		else
		{
			languageInput = <Textbox hint={"e.g. \"English (GB)\""} name={"language"} value={this.state.language} onFieldChange={this.onFieldChange} />
		}

		// If no collectionIndex is supplied, allow them to select one from the list
		let selectCollection;
		if(!this.props.collectionIndex)
		{
			let options = [];

			let i = 0;
			for(i; i < this.props.collectionList.length; ++i)
			{
				let collection = this.props.collectionList[i];
				let string = `${collection.type[0].toUpperCase() + collection.type.substring(1)}: ${this.props.collectionList[i].header.word}`;
				options.push(<option key={i}>{string}</option>);
			}
			selectCollection = [<h3 key={0}>Collection</h3>,
				<select key={1} name={"collection"} value={this.state.collection} onChange={this.onFieldChange}>
				{options}
			</select>]
		}

		return (
			<div className={"modal"}>
				<h3>Word</h3>
				<Textbox hint={"e.g. \"Horse\"..."} name={"word"} value={this.state.word} onFieldChange={this.onFieldChange}/>
				<h3>Language</h3>
				{languageInput}
				{selectCollection}
				<Button value={"Submit"} id={"add-node-modal-submit"} onClick={(e) =>
				{
					let data = {word: this.state.word, language: this.state.language, collectionIndex: this.props.collectionIndex, childNodeIndex: this.props.childNodeIndex};
					this.props.onNodeSubmit(e, data);
				}}/>
			</div>
		);
	}
}