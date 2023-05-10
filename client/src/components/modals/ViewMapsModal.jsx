import {Component} from "react";
import {Textbox} from "../controls/Textbox";
import {Button} from "../controls/Button";
import {LabeledControl} from "../controls/LabeledControl";
import axios from "axios";
import {GenericModal} from "./GenericModal";

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
						const userConfirmed = window.confirm("This will overwrite your currently active map.\nYou may wish to save your map before you load another one.\n\nWould you like to continue?");

						if(userConfirmed)
							this.props.loadMap(e, this.props.map, "database");
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
			loading: !!(props.activeUser)
		};

		this.onFieldChange = this.onFieldChange.bind(this);

	}

	componentDidMount()
	{
		if(this.props.activeUser)
			this.loadUserMaps(this.props.activeUser.username, this.props.activeUser.jwt);
	}

	loadUserMaps(username, jwt)
	{
		console.debug("[== LOADING MAPS ==]");

		// Fetch maps belonging to this user
		axios.get(`/maps/${username}/0/${jwt}`).then((response) =>
		{
			const handleResponse = this.props.handleResponse(response, "User's maps retrieved.", null, false);
			console.log(handleResponse);
			if(handleResponse === true)
			{
				this.setState({loadedMaps: response.data.maps, loading: false})
			}
			else if(handleResponse === false)
			{
				console.error("Error loading maps.");
			}
			else
			{
				this.loadUserMaps(this.props.activeUser.username, this.props.activeUser.jwt);
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

	render()
	{
		let mapItems = [];
		if(this.props.activeUser)
		{
			this.state.loadedMaps.forEach((m) => mapItems.push(<MapItem activeUser={this.props.activeUser} map={m} openModal={this.props.openModal}
			                                                            loadMap={this.props.loadMap} deleteMap={this.props.deleteMap} />));
		}

		if(this.state.loading)
			mapItems = "Loading...";
		else if(mapItems.length === 0)
		{
			if(this.props.activeUser)
				mapItems = "No maps here! Try saving one to your profile! Alternatively, feel free to load one in from a file.";
			else
				mapItems = "No maps here! Log in to save one to your profile! Alternatively, feel free to load one in from a file.";
		}

		return (
			<div className={"modal"}>
				<div className={"top"}>
					<div className={"left load"}>
						<h2>View / Import Map</h2>
						<div className={"map-data"}>
							<div className={"section"}>
								{mapItems}
							</div>
							<div className={"section"}>
								<h4>Load From File</h4>
								<div className={"form"}>
									<input type={"file"} id={"mapJSON"} name={"mapJSON"} accept={"application/json"} />
									<Button value={"Import..."} onClick={(e) =>
									{
										const files = document.getElementById("mapJSON").files;
										if(files.length > 0)
										{
											const userConfirmed = window.confirm("This will overwrite your current map.\nYou should save your map before you load another one.\n\nWould you like to continue?");
											if(userConfirmed)
											{
												const fileReader = new window.FileReader();
												fileReader.onload = () => this.props.loadMap(e, JSON.parse(fileReader.result), "file");
												fileReader.readAsText(files[0]);
											}
										}
									}}/>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className={"bottom"}>
				</div>
			</div>
		);
	}
}
