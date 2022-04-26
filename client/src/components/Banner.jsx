import {Component} from "react";
import {LoginRegisterModal} from "./modals/LoginRegisterModal";
import {SaveModal} from "./modals/SaveModal";
import {ViewMapsModal} from "./modals/ViewMapsModal";

export class Banner extends Component
{
	constructor(props)
	{
		super(props);
	}

	render()
	{
		let text = "Save your maps and share them with the community:";
		let buttons = [
			<div className={"login-button"} onClick={(e) => {
				this.props.openModal(e, <LoginRegisterModal mode={"login"} handler={this.props.authenticateUser} />);
			}}>
				Log In
			</div>,
			<div className={"register-button"} onClick={(e) => {
				this.props.openModal(e, <LoginRegisterModal mode={"register"} handler={this.props.registerUser} />);
			}}>
				Register
			</div>
		];
		if(this.props.activeUser)
		{
			text = "";
			buttons = [
				<div className={"save-button"} onClick={(e) => {
					this.props.openModal(e, <SaveModal handler={this.props.saveMap} activeMap={this.props.activeMap} />);
				}}>
					Save Map / Export
				</div>,
				<div className={"view-maps-button"} onClick={(e) => {
					this.props.openModal(e, <ViewMapsModal loadMap={this.props.loadMap} deleteMap={this.props.deleteMap} activeUser={this.props.activeUser} />);
				}}>
					View Maps / Import
				</div>,
				<div className={"showcase-button"}>
					Community Showcase
				</div>,
				<div className={"settings-button"}>
					Profile Settings
				</div>,
				<div className={"logout-button"} onClick={this.props.logoutUser}>
					Log Out
				</div>
			];
		}

		const loggedIn = (this.props.activeUser) ? " logged-in" : "";

		return(
			<div className={"banner-container" + loggedIn}>
				<h2>LEMA: Linguistic Etymology Map Assistant</h2>
				<p>{text}</p>
				<div className={"buttons-container"}>
					{buttons}
				</div>
			</div>
		)
	}
}