import {Component} from "react";
import {Textbox} from "./Textbox";
import {Button} from "./Button";
import {RadioGroup} from "./RadioGroup";

export class AddEditNodeModal extends Component
{
	constructor(props)
	{
		super(props);
		this.state = {
			word: this.props.node.word || null,
			colour: this.props.node.colour || null,
			labelType: (this.props.node.label !== undefined) ? this.props.node.label.type || null : null,
			customText: (this.props.node.label !== undefined) ? this.props.node.label.customText || null : null, // Note: Text can be ""
			fontColour: (this.props.node.label !== undefined) ? this.props.node.label.fontColour || null : null,

			// Optional or can be overridden
			language: (typeof this.props.language === "object") ? this.props.language[0] : this.props.language,
			collection: (this.props.collectionList !== undefined)
				? (`${this.props.collectionList[0].type[0].toUpperCase() + this.props.collectionList[0].type.substring(1)}: ${this.props.collectionList[0].header.word}`) : null,
		};

		this.onNodeSubmit = this.props.onNodeSubmit.bind(this);
		this.onFieldChange = this.onFieldChange.bind(this);
		this.onLabelRadioClick = this.onLabelRadioClick.bind(this);
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

	onLabelRadioClick(e, data)
	{
		// Update parent LeftBar component's state
		let labelType;
		if(data.id === 0) labelType = "language";
		else if(data.id === 1) labelType = "country";
		else if(data.id === 2) labelType = "customLabel";

		this.setState({labelType: labelType});
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
		if(!this.props.collectionIndex === undefined)
		{
			let options = [];

			let i = 0;
			for(i; i < this.props.collectionList.length; ++i)
			{
				let collection = this.props.collectionList[i];
				let string = `${collection.type[0].toUpperCase() + collection.type.substring(1)}: ${this.props.collectionList[i].header.word}`;
				options.push(<option key={i}>{string}</option>);
			}
			selectCollection = [
				<h3 key={0}>Collection</h3>,
				<select key={1} name={"collection"} value={this.state.collection} onChange={this.onFieldChange}>
					{options}
				</select>
			];
		}

		// RadioGroup buttons
		const buttons = [{active: false, label: "Node language"}, {active: false, label: "Node country/region"}, {active: false, label: "Custom label:"}];
		let labelTypeIndex = (this.state.labelType === "language") ? 0 : (this.state.labelType === "country") ? 1 : 2;
		buttons[labelTypeIndex].active = true;

		// Label components (if appropriate)
		let labelControls = [];
		if(this.props.node.label)
		{
			labelControls = [
				<h3>Label</h3>,
				<div className={"label-controls-container"}>,
					<h4>Text:</h4>
					<RadioGroup buttons={buttons} name={"custom-label"} onButtonClick={this.onLabelRadioClick} />
					<Textbox hint={"Custom label text..."} name={"customLabel"} value={this.state.customText} onFieldChange={this.onFieldChange} />
					<div className={"label-colour-container"}>
						<h4>Font colour: </h4>
						<input type={"textbox"} name={"fontColour"} value={this.state.fontColour} onChange={this.onFieldChange} />
						<input type={"color"} defaultValue={this.state.fontColour} value={this.state.fontColour} onChange={(e) => {
							this.setState({fontColour: e.target.value});
						}}/>
					</div>
				</div>
			]
		}

		return (
			<div className={"modal"}>
				<h3>Word</h3>
				<Textbox hint={"e.g. \"Horse\"..."} name={"word"} value={this.state.word} onFieldChange={this.onFieldChange}/>
				<h3>Language</h3>
				{languageInput}
				<h3>Node Colour</h3>
				<div className={"node-colour-container"}>
					<input type={"textbox"} name={"colour"} value={this.state.colour} onChange={this.onFieldChange} />
					<input type={"color"} defaultValue={this.state.colour} value={this.state.colour} onChange={(e) => {
						this.setState({colour: e.target.value});
					}}/>
				</div>
				{labelControls}
				{selectCollection}
				<Button value={"Submit"} id={"add-node-modal-submit"} onClick={(e) =>
				{
					let data = this.state;
					data.collectionIndex = this.props.collectionIndex;
					data.childNodeIndex = this.props.childNodeIndex;
					this.props.onNodeSubmit(e, data);
				}}/>
			</div>
		);
	}
}