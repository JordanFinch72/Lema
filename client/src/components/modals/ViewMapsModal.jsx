import {Component} from "react";
import {Textbox} from "../controls/Textbox";
import {Button} from "../controls/Button";
import {LabeledControl} from "../controls/LabeledControl";
import axios from "axios";

class MapItem extends Component
{
	constructor(props)
	{
		super(props);
	}

	render()
	{
		return(
			<div className={"map-item"}>
				{/* Flex-row */}
				<div className={"title"}>{this.props.map.activeMap.title}</div>
				<div className={"buttons-container"}>
					<Button value={"LOAD"} onClick={(e) => {
						const userConfirmed = window.confirm("This will overwrite your current map.\nYou should save your map before you load another one.\n\nWould you like to continue?");

						if(userConfirmed)
							this.props.loadMap(e, this.props.map);
					}} />
					<Button value={"X"} onClick={(e) => {
						const userConfirmed = window.confirm("This will permanently delete this map from the database (and the showcase)!\n\nWould you like to continue?");

						if(userConfirmed)
							this.props.deleteMap(e, this.props.map.activeMap.mapID);
					}} />
				</div>

			</div>
		)
	}
}

export class ViewMapsModal extends Component
{
	constructor(props)
	{
		super(props);

		this.state = {
			loadedMaps: [],
			loadedFileName: null,
			loading: true
		};

		this.onFieldChange = this.onFieldChange.bind(this);
	}

	componentDidMount()
	{
		// Fetch maps belonging to this user
		const username = this.props.activeUser.username;
		axios.get(`maps/${username}/0`).then((response) =>
		{
			console.log(response);
			if(response.data.type === "error")
			{
				console.error(response.data.message);
				alert(response.data.message);
			}
			else if(response.data.type === "success")
			{
				console.log(response.data);
				if(response.data.message === "User's maps retrieved.")
				{
					this.setState({loadedMaps: response.data.maps, loading: false})
				}
			}
		});
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

	/**
	 * Validates file upload.
	 * @returns {boolean}
	 */
	validate()
	{
		/*let errorCollector = "";

		 if(errorCollector !== "")
		 {
		 alert(errorCollector);
		 return false;
		 }
		 else return true;*/
	}

	render()
	{
		let mapItems = [];
		this.state.loadedMaps.forEach((m) => mapItems.push(<MapItem map={m} loadMap={this.props.loadMap} deleteMap={this.props.deleteMap} />));
		if(this.state.loading)
			mapItems = "Loading...";
		else if(mapItems.length === 0)
			mapItems = "No maps here! Try saving one to your profile! Alternatively, feel free to load one in from a file.";

		return (
			<div className={"modal"}>
				<div className={"top"}>
					<div className={"left load"}>
						<h2>View / Import Map</h2>
						<div className={"map-data"}>
							<div className={"section"}>
								{mapItems}
							</div>
						</div>
					</div>
				</div>
				<div className={"bottom"}>
					<div className={"left"}>
						<Button value={"Load from file..."} onClick={(e) =>
						{
							/*if(this.validate())
							{
								this.props.handler(e, this.state);
							}*/
						}}/>
						<Textbox name={"loadedFileName"} value={this.state.loadedFileName} hint={"Accepted: .json"} onFieldChange={this.onFieldChange} />
					</div>
				</div>
			</div>
		);
	}
}