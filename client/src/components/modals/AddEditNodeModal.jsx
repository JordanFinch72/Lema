import {Component} from "react";
import {Textbox} from "../controls/Textbox";
import {Button} from "../controls/Button";
import {LabeledControl} from "../controls/LabeledControl";
import {ColourPicker} from "../controls/ColourPicker";

export class AddEditNodeModal extends Component
{
	constructor(props)
	{
		super(props);
		this.state = {
			/* Node properties */
			word: this.props.node.word || null,
			parents: this.props.node.parents || null,
			collectionIndex: (this.props.collectionIndex !== undefined) ? this.props.collectionIndex : null,

			// Cognate properties
			strokeColour: this.props.node.strokeColour || null,
			fillColour: this.props.node.fillColour || null,
			labelType: (this.props.node.label !== undefined) ? this.props.node.label.type || null : null,
			labelCustomText: (this.props.node.label !== undefined) ? this.props.node.label.customText || null : null, // Note: Text can be ""
			labelFontColour: (this.props.node.label !== undefined) ? this.props.node.label.fontColour || null : null,

			// Journey properties
			vertexTextType: (this.props.node.vertex !== undefined) ? this.props.node.vertex.type || null : null,
			vertexCustomText: (this.props.node.vertex !== undefined) ? this.props.node.vertex.customText || null : null, // Note: Text can be ""
			vertexFontColour: (this.props.node.vertex !== undefined) ? this.props.node.vertex.fontColour || null : null,
			vertexStrokeColour: (this.props.node.vertex !== undefined) ? this.props.node.vertex.strokeColour || null : null,
			vertexFillColour: (this.props.node.vertex !== undefined) ? this.props.node.vertex.fillColour || null : null,
			vertexEdgeStrokeColour: (this.props.node.vertex !== undefined) ? this.props.node.vertex.edgeStrokeColour || null : null,
			vertexEdgeStrokeWidth: (this.props.node.vertex !== undefined) ? this.props.node.vertex.edgeStrokeWidth || null : null,
			vertexArrowheadEnabled: (this.props.node.vertex !== undefined) ? this.props.node.vertex.edgeArrowheadEnabled || null : null,
			vertexArrowheadStrokeColour: (this.props.node.vertex !== undefined) ? this.props.node.vertex.edgeArrowheadStrokeColour || null : null,
			vertexArrowheadFillColour: (this.props.node.vertex !== undefined) ? this.props.node.vertex.edgeArrowheadFillColour || null : null,

			// Optional or can be overridden
			isNewWord: this.props.isNewWord,
			language: (typeof this.props.language === "object") ? this.props.language[0] : this.props.language,
			collectionList: (this.props.collectionList !== undefined) ? this.props.collectionList || null : null
		};

		this.onNodeSubmit = this.props.onNodeSubmit.bind(this);
		this.onFieldChange = this.onFieldChange.bind(this);
		this.onParentNodeAddRemoveClick = this.onParentNodeAddRemoveClick.bind(this);
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
	onParentNodeAddRemoveClick(e, mode)
	{
		// Find associated node via data-index
		const node = this.props.words[e.target.parentElement.parentElement.parentElement.dataset.index];
		const parents = this.props.node.parents;

		if(mode === "add")
			parents.push(node);
		else if(mode === "remove")
			parents.splice(parents.indexOf(node), 1);

		this.setState({parents: parents});
	}

	validation()
	{
		// TODO: Validate form data
		return true;
	}

	render()
	{
		// Language input is a Textbox if none or one language is supplied, or a drop-down menu if some are supplied
		let languageInput;
		if(typeof this.props.language === "object")
		{
			const options = [];
			for(let i = 0; i < this.props.language.length; ++i)
			{
				options.push(<option key={i}>{this.props.language[i]}</option>);
			}
			languageInput =
				<select name={"language"} value={this.state.language} onChange={this.onFieldChange}>
					{options}
				</select>
		}
		else
		{
			languageInput = <Textbox hint={"e.g. \"English\""} name={"language"} value={this.state.language} onFieldChange={this.onFieldChange} />
		}

		let collectionInput;
		console.log("collectionList");
		console.log(this.state.collectionList);
		if(this.state.collectionList)
		{
			// Create options
			const options = [];
			for(let i = 0; i < this.state.collectionList.length; ++i)
			{
				const collection = this.state.collectionList[i];
				const option = `${collection.header.word} (${collection.header.language})`;
				options.push(<option key={i}>{option}</option>)
			}

			// Find default collection for the <select>
			let currentCollection = this.state.collectionList.find((c) => {
				console.log("HELLO");
				console.log(c.collectionIndex);
				console.log(this.state.collectionIndex);
				return c.collectionIndex === this.state.collectionIndex;
			});
			if(currentCollection != null) currentCollection = `${currentCollection.header.word} (${currentCollection.header.language})`

			// Create select
			collectionInput =
				<select name={"collection"} defaultValue={currentCollection} onChange={(e) => {
					const newCollectionIndex = this.state.collectionList[e.target.selectedIndex].collectionIndex; // Find collectionIndex of selected option
					this.setState({collectionIndex: newCollectionIndex}, () => {alert(this.state.collectionIndex)});
				}}>
					{options}
				</select>
		}

		/* Construct list of nodes that are the word's parent or can be added as the word's parent */
		const parentNodeList = [];
		if(this.props.type === "journey" && this.props.words)
		{
			for(let i = 0; i < this.props.words.length; ++i)
			{
				// List all nodes
				const wordNode = this.props.words[i];
				if(this.props.node !== wordNode)
				{
					// If true, disables adding and enables deletion. If false, the inverse
					const isAlreadyParent = this.props.node.parents.includes(wordNode);

					parentNodeList.push(
					<div key={i} data-index={i} className={"parent-node"}>
						<div className={"word"}>{wordNode.word} ({wordNode.language})</div>
						<div className={"buttons"}>
							<Button name={"addParent"} value={"+"} disabled={isAlreadyParent} onClick={(e) => this.onParentNodeAddRemoveClick(e, "add")} />
							<Button name={"removeParent"} value={"X"} disabled={!isAlreadyParent} onClick={(e) => this.onParentNodeAddRemoveClick(e, "remove")} />
						</div>
					</div>);
				}
			}
		}

		return (
			<div className={"modal"}>
				<h2>New Node</h2>
				<div className={"top"}>
					<div className={"left"}>
						<h3>Node Data</h3>
						<div className={"node-data"}>
							{/* cognateWordLanguage */}
							<div className={"section"}>
								<h4>Word / Language</h4>
								<div className={"form"}>
									<LabeledControl label={"Word: "}>
										<Textbox name={"word"} value={this.state.word} hint={"e.g. \"vivification\""} onFieldChange={this.onFieldChange} />
									</LabeledControl>
									<LabeledControl label={"Language: "}>
										{languageInput}
									</LabeledControl>
									<LabeledControl label={"Collection: "}>
										{collectionInput}
									</LabeledControl>
								</div>
							</div>
							{/* parentNodes */}
							<div className={"section"}>
								<h4>Parent Nodes:</h4>
								<div className={"parent-node-list"}>
									{parentNodeList}
								</div>
							</div>
						</div>
					</div>
					<div className={"right"}>
						<h3>Node Appearance</h3>
						{this.props.node.vertex !== undefined && /* Vertex appearance */
							<div className={"node-appearance"}>
								<div className={"section"}>
									<h4>Vertex</h4>
									<div className={"form"}>
										<LabeledControl label={"Stroke colour: "}>
											<Textbox name={"vertexStrokeColour"}  value={this.state.vertexStrokeColour} hint={"Hexadecimal value (e.g. #000000)"} onFieldChange={this.onFieldChange} />
											<ColourPicker name={"vertexStrokeColour"} value={this.state.vertexStrokeColour} onChange={this.onFieldChange} />
										</LabeledControl>
										<LabeledControl label={"Fill colour: "}>
											<Textbox name={"vertexFillColour"}  value={this.state.vertexFillColour} hint={"Hexadecimal value (e.g. #FFFFFF)"} onFieldChange={this.onFieldChange} />
											<ColourPicker name={"vertexFillColour"} value={this.state.vertexFillColour} onChange={this.onFieldChange} />
										</LabeledControl>
									</div>
								</div>
								<div className={"section"}>
									<h4>Parent Edge</h4>
									<div className={"form"}>
										<LabeledControl label={"Stroke colour: "}>
											<Textbox name={"vertexEdgeStrokeColour"}  value={this.state.vertexEdgeStrokeColour} hint={"Hexadecimal value (e.g. #000000)"} onFieldChange={this.onFieldChange} />
											<ColourPicker name={"vertexEdgeStrokeColour"} value={this.state.vertexEdgeStrokeColour} onChange={this.onFieldChange} />
										</LabeledControl>
										<LabeledControl label={"Stroke width: "}>
											<Textbox name={"vertexEdgeStrokeWidth"}  value={this.state.vertexEdgeStrokeWidth} hint={"Pixel value (e.g. 2px)"} />
										</LabeledControl>
									</div>
								</div>
								<div className={"section"}>
									<h4>Edge Arrowhead</h4>
									<div className={"form"}>
										<LabeledControl label={"Visible?"}>
											<input type={"checkbox"} name={"vertexArrowheadEnabled"} checked={this.state.vertexArrowheadEnabled} onChange={this.onFieldChange} />
										</LabeledControl>
										<LabeledControl label={"Stroke colour: "}>
											<Textbox name={"vertexArrowheadStrokeColour"} value={this.state.vertexArrowheadStrokeColour} hint={"Hexadecimal value (e.g. #000000)"} onFieldChange={this.onFieldChange} />
											<ColourPicker name={"vertexArrowheadStrokeColour"} value={this.state.vertexArrowheadStrokeColour} onChange={this.onFieldChange} />
										</LabeledControl>
										<LabeledControl label={"Fill colour: "}>
											<Textbox name={"vertexArrowheadFillColour"}  value={this.state.vertexArrowheadFillColour} hint={"Hexadecimal value (e.g. #000000)"} onFieldChange={this.onFieldChange} />
											<ColourPicker name={"vertexArrowheadFillColour"} value={this.state.vertexArrowheadFillColour} onChange={this.onFieldChange} />
										</LabeledControl>
									</div>
								</div>
								<div className={"section"}>
									<h4>Label</h4>
									<div className={"form"}>
										<LabeledControl label={"Text: "}>
											<select name={"vertexTextType"} value={this.state.vertexTextType} onChange={(e) => {
												this.setState({vertexCustomText: ""}); // Automatically clear "Custom text" field
												this.onFieldChange(e);
											}}>
												<option>Word</option>
												<option>Language</option>
												<option>Custom text</option>
											</select>
										</LabeledControl>
										<LabeledControl label={"Custom text: "}>
											<Textbox name={"vertexCustomText"} value={this.state.vertexCustomText} hint={"e.g. \"Coolest word ever!\""} onFieldChange={(e) => {
												this.setState({vertexTextType: "Custom text"}); // Automatically change type to "Custom text"
												this.onFieldChange(e);
											}} />
										</LabeledControl>
										<LabeledControl label={"Font colour: "}>
											<Textbox name={"vertexFontColour"}  value={this.state.vertexFontColour} hint={"Hexadecimal value (e.g. #000000)"} onFieldChange={this.onFieldChange} />
											<ColourPicker name={"vertexFontColour"} value={this.state.vertexFontColour} onChange={this.onFieldChange} />
										</LabeledControl>
									</div>
								</div>
							</div>
						}
						{this.props.node.label !== undefined && /* Cognate label appearance */
							<div className={"node-appearance"}>
								<div className={"section"}>
									<h4>Country/Region</h4>
									<div className={"form"}>
										<LabeledControl label={"Stroke colour: "}>
											<Textbox name={"strokeColour"}  value={this.state.strokeColour} hint={"Hexadecimal value (e.g. #000000)"} onFieldChange={this.onFieldChange} />
											<ColourPicker name={"strokeColour"} value={this.state.strokeColour} onChange={this.onFieldChange} />
										</LabeledControl>
										<LabeledControl label={"Fill colour: "}>
											<Textbox name={"fillColour"}  value={this.state.fillColour} hint={"Hexadecimal value (e.g. #FFFFFF)"} onFieldChange={this.onFieldChange} />
											<ColourPicker name={"fillColour"} value={this.state.fillColour} onChange={this.onFieldChange} />
										</LabeledControl>
									</div>
								</div>
								<div className={"section"}>
									<h4>Label</h4>
									<div className={"form"}>
										<LabeledControl label={"Text: "}>
											<select name={"labelType"} value={this.state.labelType} onChange={this.onFieldChange}>
												<option>Word</option>
												<option>Language</option>
												<option>Country/region</option>
												<option>Custom text</option>
											</select>
										</LabeledControl>
										<LabeledControl label={"Custom text: "}>
											<Textbox name={"labelCustomText"} value={this.state.labelCustomText} hint={"e.g. \"Coolest country ever!\""} onFieldChange={this.onFieldChange} />
										</LabeledControl>
										<LabeledControl label={"Font colour: "}>
											<Textbox name={"labelFontColour"}  value={this.state.labelFontColour} hint={"Hexadecimal value (e.g. #000000)"} onFieldChange={this.onFieldChange} />
											<ColourPicker name={"labelFontColour"} value={this.state.labelFontColour} onChange={this.onFieldChange} />
										</LabeledControl>
									</div>
								</div>
							</div>
						}
					</div>
				</div>
				<div className={"bottom"}>
					<div className={"buttons-container"}>
						<Button value={(this.props.isNewWord) ? "Add Node" : "Save Changes"} onClick={(e) => {
							if(this.validation())
							{
								// Build node structure to match collection type
								let updatedNode;
								if(this.props.type === "journey")
								{
									updatedNode = {
										...this.props.node,
										word: this.state.word, language: this.state.language, colour: this.state.colour,
										vertex: {
											...this.props.node.vertex,
											type: this.state.vertexTextType,
											customText: this.state.vertexCustomText,
											fontColour: this.state.vertexFontColour,
											strokeColour: this.state.vertexStrokeColour,
											fillColour: this.state.vertexFillColour,
											edgeStrokeColour: this.state.vertexEdgeStrokeColour,
											edgeStrokeWidth: this.state.vertexEdgeStrokeWidth,
											edgeArrowheadEnabled: this.state.vertexArrowheadEnabled,
											edgeArrowheadStrokeColour: this.state.vertexArrowheadStrokeColour,
											edgeArrowheadFillColour: this.state.vertexArrowheadFillColour
										}
									};
								}
								else if(this.props.type === "cognate")
								{
									updatedNode = {
										...this.props.node,
										word: this.state.word, language: this.state.language,
										fillColour: this.state.fillColour, strokeColour: this.state.strokeColour,
										label: {
											...this.props.node.label,
											type: this.state.labelType,
											customText: this.state.labelCustomText,
											fontColour: this.state.labelFontColour,
											fontSize: this.state.fontSize
										}
									};
								}

								const newCollectionIndex = (this.state.collectionIndex !== this.props.collectionIndex) ? this.state.collectionIndex : null;
								alert(newCollectionIndex);
								this.props.onNodeSubmit(e, this.props.collectionIndex, updatedNode, newCollectionIndex);
							}
						}} />
					</div>
				</div>
			</div>
		);
	}
}