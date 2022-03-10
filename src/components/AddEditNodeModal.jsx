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
			/* Node properties */
			word: this.props.node.word || null,
			parents: this.props.node.parents,
			selectedParentIndex: 0,

			// Cognate properties
			strokeColour: this.props.node.fillColour || null,
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
			language: (typeof this.props.language === "object") ? this.props.language[0] : this.props.language,
			collection: (this.props.collectionList !== undefined)
				? (`${this.props.collectionList[0].type[0].toUpperCase() + this.props.collectionList[0].type.substring(1)}: ${this.props.collectionList[0].header.word}`) : null,
		};

		this.onNodeSubmit = this.props.onNodeSubmit.bind(this);
		this.onFieldChange = this.onFieldChange.bind(this);
		this.onLabelRadioClick = this.onLabelRadioClick.bind(this);
		this.onVertexRadioClick = this.onVertexRadioClick.bind(this);
	}

	onFieldChange(event)
	{
		const target = event.target;
		const name = target.name;
		let value = (target.type === "checkbox") ? target.checked : target.value;

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
		else if(data.id === 2) labelType = "word";
		else if(data.id === 3) labelType = "customText";

		this.setState({labelType: labelType});
	}
	onVertexRadioClick(e, data)
	{
		// Update parent LeftBar component's state
		let vertexTextType;
		if(data.id === 0) vertexTextType = "language";
		else if(data.id === 1) vertexTextType = "country";
		else if(data.id === 2) vertexTextType = "word";
		else if(data.id === 3) vertexTextType = "customText";

		this.setState({vertexTextType: vertexTextType}, (e) => {console.log(this.state.vertexTextType)});
	}
	validation()
	{
		// TODO: Validate form data
		return true;
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

		// Label components (if appropriate)
		let labelControls = [], nodeColourControls = [];
		if(this.props.node.label)
		{
			// RadioGroup buttons
			const buttons = [{active: false, label: "Node language"}, {active: false, label: "Node country/region"}, {active: false, label: "Word"}, {active: false, label: "Custom label:"}];
			let labelTypeIndex;
			if(this.state.labelType === "language")
				labelTypeIndex = 0;
			else if(this.state.labelType === "country")
				labelTypeIndex = 1;
			else if(this.state.labelType === "word")
				labelTypeIndex = 2;
			else if(this.state.labelType === "customText")
				labelTypeIndex = 3;
			buttons[labelTypeIndex].active = true;

			labelControls = [
				<h3>Label</h3>,
				<div className={"label-controls-container"}>,
					<h4>Text:</h4>
					<RadioGroup buttons={buttons} name={"custom-label"} onRadioButtonClick={this.onLabelRadioClick} />
					<Textbox hint={"Custom label text..."} name={"labelCustomText"} value={this.state.labelCustomText} onFieldChange={this.onFieldChange} />
					<div className={"label-colour-container"}>
						<h4>Node country/region colour: </h4>
						<div className={"node-colour-container"}>
							<input type={"textbox"} name={"colour"} value={this.state.fillColour} onChange={this.onFieldChange} />
							<input type={"color"} defaultValue={this.state.colourfillColour} value={this.state.fillColour} onChange={(e) => {
								this.setState({fillColour: e.target.value});
							}}/>
						</div>
					</div>
					<div className={"label-colour-container"}>
						<h4>Font colour: </h4>
						<div>
							<input type={"textbox"} name={"labelFontColour"} value={this.state.labelFontColour} onChange={this.onFieldChange} />
							<input type={"color"} defaultValue={this.state.labelFontColour} value={this.state.labelFontColour} onChange={(e) => {
								this.setState({labelFontColour: e.target.value});
							}}/>
						</div>
					</div>
				</div>
			]
		}

		// Vertex properties (if appropriate)
		let vertexControls = [];
		if(this.props.node.vertex)
		{
			// RadioGroup buttons
			const buttons = [{active: false, label: "Node language"}, {active: false, label: "Node country/region"}, {active: false, label: "Word"}, {active: false, label: "Custom label:"}];
			let vertexTextType;
			if(this.state.vertexTextType === "language")
				vertexTextType = 0;
			else if(this.state.vertexTextType === "country")
				vertexTextType = 1;
			else if(this.state.vertexTextType === "word")
				vertexTextType = 2;
			else if(this.state.vertexTextType === "customText")
				vertexTextType = 3;
			buttons[vertexTextType].active = true;

			vertexControls = [
				<h3>Vertex</h3>,
				<div className={"vertex-controls-container"}>,
					<h4>Text:</h4>
					<RadioGroup buttons={buttons} name={"custom-vertex-text"} onRadioButtonClick={this.onVertexRadioClick} />
					<Textbox hint={"Custom vertex text..."} name={"vertexCustomText"} value={this.state.vertexCustomText} onFieldChange={this.onFieldChange} />
					<div className={"label-colour-container"}>
						<h4>Font colour: </h4>
						<div>
							<input type={"textbox"} name={"vertexFontColour"} value={this.state.vertexFontColour} onChange={this.onFieldChange} />
							<input type={"color"} defaultValue={this.state.vertexFontColour} value={this.state.vertexFontColour} onChange={(e) => {
								this.setState({vertexFontColour: e.target.value});
							}}/>
						</div>
					</div>
					<h4>Vertex:</h4>
					<div className={"vertex-colour-container"}>
						<h4>Vertex stroke colour: </h4>
						<div>
							<input type={"textbox"} name={"vertexStrokeColour"} value={this.state.vertexStrokeColour} onChange={this.onFieldChange} />
							<input type={"color"} defaultValue={this.state.vertexStrokeColour} value={this.state.vertexStrokeColour} onChange={(e) => {
								this.setState({vertexStrokeColour: e.target.value});
							}}/>
						</div>
					</div>
					<div className={"vertex-colour-container"}>
						<h4>Vertex fill colour: </h4>
						<div>
							<input type={"textbox"} name={"vertexFillColour"} value={this.state.vertexFillColour} onChange={this.onFieldChange} />
							<input type={"color"} defaultValue={this.state.vertexFillColour} value={this.state.vertexFillColour} onChange={(e) => {
								this.setState({vertexFillColour: e.target.value});
							}}/>
						</div>
					</div>
					<div className={"vertex-colour-container"}>
						<h4>Parent edge colour: </h4>
						<div>
							<input type={"textbox"} name={"vertexEdgeStrokeColour"} value={this.state.vertexEdgeStrokeColour} onChange={this.onFieldChange} />
							<input type={"color"} defaultValue={this.state.vertexEdgeStrokeColour} value={this.state.vertexEdgeStrokeColour} onChange={(e) => {
								this.setState({vertexEdgeStrokeColour: e.target.value});
							}}/>
						</div>
					</div>
					<div className={"vertex-colour-container"}>
						<h4>Parent edge stroke width:</h4>
						<div>
							<input type={"textbox"} name={"vertexEdgeStrokeWidth"} value={this.state.vertexEdgeStrokeWidth} onChange={this.onFieldChange} />
						</div>
					</div>
					<div className={"vertex-colour-container"}>
						<h4>Show arrowhead?</h4>
						<div>
							<input type={"checkbox"} name={"vertexArrowheadEnabled"} checked={this.state.vertexArrowheadEnabled} onChange={this.onFieldChange} />
						</div>
					</div>
					<div className={"vertex-colour-container"}>
						<h4>Arrowhead stroke colour:</h4>
						<div>
							<input type={"textbox"} name={"vertexArrowheadStrokeColour"} value={this.state.vertexArrowheadStrokeColour} onChange={this.onFieldChange} />
							<input type={"color"} defaultValue={this.state.vertexArrowheadStrokeColour} value={this.state.vertexArrowheadStrokeColour} onChange={(e) => {
								this.setState({vertexArrowheadStrokeColour: e.target.value});
							}}/>
						</div>
					</div>
					<div className={"vertex-colour-container"}>
						<h4>Arrowhead fill colour:</h4>
						<div>
							<input type={"textbox"} name={"vertexArrowheadFillColour"} value={this.state.vertexArrowheadFillColour} onChange={this.onFieldChange} />
							<input type={"color"} defaultValue={this.state.vertexArrowheadFillColour} value={this.state.vertexArrowheadFillColour} onChange={(e) => {
								this.setState({vertexArrowheadFillColour: e.target.value});
							}}/>
						</div>
					</div>
				</div>
			]
		}


		// TODO: Decide between:
		//   - (1) changing HCI so that users create a child node from a parent, and can only make a (single) parent node per collection from the collection context menu
		//   - (2) passing down the collection's words into the modal as a prop. Not sure what kind of performance/memory hit this would induce
		// Parents
		let parentList = [], potentialParentList = [], parentControls = [];
		if(this.props.node.parents)
		{
			// Gather current parents
			for(let i = 0; i < this.props.node.parents.length; ++i)
			{
				let parent = this.props.node.parents[i];
				parentList.push(<div className={"parent-list"}>
					<div>
						{parent.word + " (" + parent.language + ")"}
					</div>
					<div>
						<Button value={"X"} onClick={(e) => {
							this.props.node.parents.splice(i, 1);
							this.setState({parents: this.props.node.parents});
						}} />
					</div>
				</div>);
			}
		}
		if(this.props.words)
		{
			for(let i = 0; i < this.props.words.length; ++i)
			{
				// List all potential new parents
				let word = this.props.words[i];
				if(this.props.node !== word && !this.props.node.parents.includes(word))
				{
					potentialParentList.push(<option key={i} data-index={i}>{word.word + " (" + word.language + ")"}</option>);
				}
			}
		}
		console.log(potentialParentList);
		let potentialParents = <select name={"selectedParent"} onChange={(event) => {
			const selectedIndex = event.target.selectedIndex;

			this.setState({
				selectedParentIndex: selectedIndex
			});
		}}>
			{potentialParentList}
		</select>;
		if(potentialParents)
		{
			parentControls = <Button id={"add-node-modal-add-parent"} value={"Add parent"} onClick={(e) => {
				let selectedParent = potentialParentList[this.state.selectedParentIndex];
				let parentIndex = selectedParent.props["data-index"];
				this.props.node.parents.push(this.props.words[parentIndex]);
				this.setState({parents: this.props.node.parents});
			}} />
		}

		return (
			<div className={"modal"}>
				<div className={"top"}>
					<div className={"left"}>
						<h3>Node Data</h3>
						<div className={"node-data"}>
							{/* cognateWordLanguage */}
							<div className={"section"}>
								<h4>Word / Language</h4>
								<div className={"form"}>
									<div className={"labeled-control"}> {/* TODO: Convert to component */}
										<div className={"label"}>Word:</div>
										<div className={"control"}>
											<Textbox hint={"Enter node word..."} />
										</div>
									</div>
									<div className={"labeled-control"}>
										<div className={"label"}>Language:</div>
										<div className={"control"}>
											<Textbox hint={"Enter node language..."} />
										</div>
									</div>
								</div>
							</div>
							{/* parentNodes */}
							<div className={"section"}>
								<h4>Parent Nodes:</h4>
								<div className={"parent-node-list"}>
									<div className={"parent-node"}> {/* TODO: Convert to component? */}
										<div className={"word"}>*kers-</div>
										<div className={"buttons"}>
											<Button value={"+"} onClick={(e) => {alert("Temporary");}} />
											<Button value={"X"} disabled={true} onClick={(e) => {alert("Temporary");}} />
										</div>
									</div>
									<div className={"parent-node"}>
										<div className={"word"}>*krsós</div>
										<div className={"buttons"}>
											<Button value={"+"} onClick={(e) => {alert("Temporary");}} />
											<Button value={"X"} disabled={true} onClick={(e) => {alert("Temporary");}} />
										</div>
									</div>
									<div className={"parent-node"}>
										<div className={"word"}>*hrussa</div>
										<div className={"buttons"}>
											<Button value={"+"} disabled={true} onClick={(e) => {alert("Temporary");}} />
											<Button value={"X"} onClick={(e) => {alert("Temporary");}} />
										</div>
									</div>
									<div className={"parent-node"}>
										<div className={"word"}>horse</div>
										<div className={"buttons"}>
											<Button value={"+"} onClick={(e) => {alert("Temporary");}} />
											<Button value={"X"} disabled={true} onClick={(e) => {alert("Temporary");}} />
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className={"right"}>
						<h3>Node Appearance</h3>
						<div className={"node-appearance"}>
							<div className={"section"}>
								<h4>Vertex</h4>
								<div className={"form"}>
									<div className={"labeled-control"}> {/* TODO: Convert to component */}
										<div className={"label"}>Stroke colour: </div>
										<div className={"control"}>
											<Textbox value={"#000000"} hint={"Hexadecimal value (e.g. #000000)"} />
											<input type={"color"} defaultValue={"#000000"} onChange={(e) => {console.log("Temporary");}} />
										</div>
									</div>
									<div className={"labeled-control"}> {/* TODO: Convert to component */}
										<div className={"label"}>Fill colour: </div>
										<div className={"control"}>
											<Textbox value={"#FF0000"} hint={"Hexadecimal value (e.g. #000000)"} />
											<input type={"color"} defaultValue={"#FF0000"} onChange={(e) => {console.log("Temporary");}} />
										</div>
									</div>
								</div>
							</div>
							<div className={"section"}>
								<h4>Parent Edge</h4>
								<div className={"form"}>
									<div className={"labeled-control"}> {/* TODO: Convert to component */}
										<div className={"label"}>Stroke colour: </div>
										<div className={"control"}>
											<Textbox value={"#000000"} hint={"Hexadecimal value (e.g. #000000)"} />
											<input type={"color"} defaultValue={"#000000"} onChange={(e) => {console.log("Temporary");}} />
										</div>

									</div>
									<div className={"labeled-control"}> {/* TODO: Convert to component */}
										<div className={"label"}>Stroke width: </div>
										<div className={"control"}>
											<Textbox value={"2px"} hint={"Pixel value (e.g. 2px)"} />
										</div>
									</div>
								</div>
							</div>
							<div className={"section"}>
								<h4>Edge Arrowhead</h4>
								<div className={"form"}>
									<div className={"labeled-control"}> {/* TODO: Convert to component? */}
										<div className={"label"}>Visible?</div>
										<div className={"control"}>
											<input type={"checkbox"} checked={true} onChange={(e) => {console.log("Temporary");}} />
										</div>
									</div>
									<div className={"labeled-control"}> {/* TODO: Convert to component */}
										<div className={"label"}>Stroke colour: </div>
										<div className={"control"}>
											<Textbox value={"#000000"} hint={"Hexadecimal value (e.g. #000000)"} />
											<input type={"color"} defaultValue={"#000000"} onChange={(e) => {console.log("Temporary");}} />
										</div>
									</div>
									<div className={"labeled-control"}> {/* TODO: Convert to component */}
										<div className={"label"}>Fill colour: </div>
										<div className={"control"}>
											<Textbox value={"#000000"} hint={"Hexadecimal value (e.g. #000000)"} />
											<input type={"color"} defaultValue={"#000000"} onChange={(e) => {console.log("Temporary");}} />
										</div>
									</div>
								</div>
							</div>
							<div className={"section"}>
								<h4>Label</h4>
								<div className={"form"}>
									<div className={"labeled-control"}> {/* TODO: Convert to component? */}
										<div className={"label"}>Text:</div>
										<div className={"control"}>
											<select value={"Word"} onChange={(e) => {console.log("Temporary");}}>
												<option>Word</option>
												<option>Language</option>
												<option>Country/region</option>
												<option>Custom text</option>
											</select>
										</div>
									</div>
									<div className={"labeled-control"}> {/* TODO: Convert to component */}
										<div className={"label"}>Custom text: </div>
										<div className={"control"}>
											<Textbox value={"2px"} hint={"Pixel value (e.g. 2px)"} onChange={(e) => { alert("Select \"Country/region\" in dropdown"); }} />
										</div>
									</div>
									<div className={"labeled-control"}> {/* TODO: Convert to component */}
										<div className={"label"}>Font colour: </div>
										<div className={"control"}>
											<Textbox value={"#000000"} hint={"Hexadecimal value (e.g. #000000)"} />
											<input type={"color"} defaultValue={"#000000"} onChange={(e) => {console.log("Temporary");}} />
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className={"bottom"}>
					<div className={"buttons-container"}>
						<Button value={"Add Node / Save Changes"} onChange={(e) => {alert("Temporary");}} />
					</div>
				</div>
			</div>
		);
	}
}