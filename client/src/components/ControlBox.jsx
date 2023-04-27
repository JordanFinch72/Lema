import {Component} from "react";
import {Textbox} from "./controls/Textbox";
import {RadioGroup} from "./controls/RadioGroup";
import {Button} from "./controls/Button";
import axios from "axios";

export class ControlBox extends Component
{
	constructor(props)
	{
		super(props);
		this.state = {
			mapMode: (this.props.isShowcaseMode) ? "all" : "journey", // "all" || "journey" || "cognate"
			searchBoxValue: "",
			searchFilter: "English",
			includeAffixes: false
		};

		this.onFieldChange = this.onFieldChange.bind(this);
		this.onButtonClick = this.onButtonClick.bind(this);
		this.onRadioButtonClick = this.onRadioButtonClick.bind(this);
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
	onButtonClick()
	{
		if(this.props.isShowcaseMode)
		{
			// TODO: Search for shared maps
		}
		else
		{
			// TODO: New source for data retrieval (unless something can be arranged)
			alert("Feature currently unavailable - but you can still add data manually!");
			/*const word = this.state.searchBoxValue;
			const language =  this.state.searchFilter;
			if(word !== "" && language !== "")
			{
				if(this.state.mapMode === "journey")
				{
					const getString = `https://api.etymologyexplorer.com/dev/get_trees?common_descendant_count=0&language=${language}&word=${word}`;
					let edWords, edConnections, edAffixes;

					axios.get(getString)
						.then((response) => {
							console.log(response);
							edWords = response.data[1].words;
							edConnections = response.data[2];
							edAffixes = (this.state.includeAffixes) ? null : response.data[1].affixes; // Only pass if user doesn't want affixes (to check against it)

							this.props.addJourneyFromDatabase(edWords, edConnections, edAffixes);
						})
						.catch((error) => {
							if(error.response.data['Error message'].indexOf("Could not get an ids") !== -1)
							{
								this.props.createToast(null, "Database error: word not found.", 5000, "error");
							}
						});
				}
				else if(this.state.mapMode === "cognate")
				{
					// TODO: Find translations for the word in every country shown on the map. Colour code translations that share the same ancestry (are cognates)
				}
			}*/
		}
	}
	onRadioButtonClick(e, data)
	{
		// Update parent LeftBar component's state
		let mode;
		if(data.id === 0) mode = (this.props.isShowcaseMode) ? "all" : "journey";
		else if(data.id === 1) mode = (this.props.isShowcaseMode ? "journey" : "cognate");
		else if(data.id === 2) mode = "cognate";
		this.setState({mapMode: mode});
	}

	render()
	{
		// Set up view
		let buttons = [
			{active: (this.state.mapMode === "journey"), label: "Historical journey"},
			{active: (this.state.mapMode === "cognate"), label: "Cognates"}
		];
		let header = "Etymology Search";
		let textboxHint = "Enter a word...";
		// TODO: This should autocomplete based on the ED's supported languages
		let languageSelect =
			<select name="searchFilter" value={this.state.searchFilter} onChange={this.onFieldChange}>
				<option>Ancient Greek</option>
				<option>English</option>
				<option>French</option>
				<option>German</option>
				<option>Latin</option>
				<option>Portuguese</option>
				<option>Spanish</option>
			</select>;
		let affixes =
			<div className={"affixes-selection"}>
				Include affixes:
				<input type={"checkbox"} name={"includeAffixes"} checked={this.state.includeAffixes} onChange={this.onFieldChange} />
				<span title={"Some words include affixes (e.g. -y) that have a considerable amount of etymological ancestors, potentially cluttering your map. \n\n" +
					"You may tick this checkbox to include them in the return data."}>?</span>
			</div>
		let modeSpan = <span title={"Historical journey mode: A new Journey collection will be created and auto-populated with nodes according to the chronological journey of that word through time (usually starting in PIE).\n\n" +
			"Cognate mode: A new Cognate collection will be created and automatically populated with translations of the searched words, with all translations that are cognates filled with the same colour.\n\n" +
			"Note: Cognate mode is currently unavailable due to server upgrades. You can still manually add cognates."}>?</span>;

		// Adjust view for the Community Showcase
		if(this.props.isShowcaseMode)
		{
			buttons = [
				{active: (this.state.mapMode === "all"), label: "All"},
				{active: (this.state.mapMode === "journey"), label: "Historical journey"},
				{active: (this.state.mapMode === "cognate"), label: "Cognates"}
			];
			header = "Community Showcase";
			textboxHint = "Enter a term...";
			languageSelect =
				<select name="searchFilter" value={this.state.searchFilter} onChange={this.onFieldChange}>
					<option>Title</option>
					<option>Description</option>
					<option>Owner</option>
				</select>;
			affixes = null; modeSpan = null;
		}

		return(
			<div className={"search-container"}>
				<h3>{header}</h3>
				<div className={"search-fields"}>
					<Textbox hint={textboxHint} name={"searchBoxValue"} value={this.state.searchBoxValue} onFieldChange={this.onFieldChange} /> {/* TODO: This should autocomplete based on the ED's words */}
					{languageSelect}
				</div>
				{affixes}
				<div className={"mode-selection"}>
					<RadioGroup buttons={buttons} name={"map-mode"} onRadioButtonClick={this.onRadioButtonClick} /> {modeSpan}
					<Button value={"Search"} id={"search"} onClick={this.onButtonClick} />
				</div>
			</div>
		)
	}
}