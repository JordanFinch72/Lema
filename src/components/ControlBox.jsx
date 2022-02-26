import {Component} from "react";
import {Textbox} from "./Textbox";
import {RadioGroup} from "./RadioGroup";
import {Button} from "./Button";
import axios from "axios";

export class ControlBox extends Component
{
	constructor(props)
	{
		super(props);
		this.state = {
			mapMode: "journey", // "journey" || "cognate"
			searchBoxValue: "",
			searchLanguage: "English"
		};


		this.onFieldChange = this.onFieldChange.bind(this);
		this.onButtonClick = this.onButtonClick.bind(this);
		this.onRadioButtonClick = this.onRadioButtonClick.bind(this);
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
	onButtonClick()
	{
		let word = this.state.searchBoxValue;
		let language =  this.state.searchLanguage;
		if(word !== "" && language !== "")
		{
			if(this.state.mapMode === "journey")
			{
				let getString = `https://api.etymologyexplorer.com/dev/get_trees?common_descendant_count=0&language=${language}&word=${word}`;
				let edWords, edConnections;

				axios.get(getString)
					.then((response) => {
						console.log(response);
						edWords = response.data[1].words;
						edConnections = response.data[2];

						this.props.addJourney(edWords, edConnections);
					})
					.catch((error) => {
						if(error.response.data['Error message'].indexOf("Could not get an ids") !== -1)
						{
							alert("Database error: word not found.");
						}
					});
			}
			else if(this.state.mapMode === "cognate")
			{
				// TODO
			}
		}
	}
	onRadioButtonClick(e, data)
	{
		// Update parent LeftBar component's state
		let mode = (data.id === 0) ? "journey" : "cognate";
		this.setState({mapMode: mode});
	}

	render()
	{
		const buttons = [{active: (this.state.mapMode === "journey"), label: "Historical journey"}, {active: (this.state.mapMode === "cognate"), label: "Cognates"}];

		return(
			<div className={"search-container"}>
				<div className={"search-fields"}>
					<Textbox hint={"Enter a word..."} name={"searchBoxValue"} value={this.state.searchBoxValue} onFieldChange={this.onFieldChange} /> {/* TODO: This should autocomplete based on the ED's supported languages */}
					<select name="searchLanguage" value={this.state.searchLanguage} onChange={this.onFieldChange}>
						<option>Ancient Greek</option>
						<option>English</option>
						<option>French</option>
						<option>German</option>
						<option>Latin</option>
						<option>Portuguese</option>
						<option>Spanish</option>
					</select>
				</div>
				<RadioGroup buttons={buttons} name={"map-mode"} onRadioButtonClick={this.onRadioButtonClick} />
				<Button value={"Search"} id={"search"} onClick={this.onButtonClick} />
			</div>
		)
	}
}