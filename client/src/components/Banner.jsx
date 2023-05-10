import {Component} from "react";
import {LoginRegisterModal} from "./modals/LoginRegisterModal";
import {SaveModal} from "./modals/SaveModal";
import {ViewMapsModal} from "./modals/ViewMapsModal";
import {ProfileSettingsModal} from "./modals/ProfileSettingsModal";
import {GenericModal} from "./modals/GenericModal";

export class Banner extends Component
{
	constructor(props)
	{
		super(props);

		this.DATABASE_DISABLED = true; // TODO: Set to false when database is migrated etc. etc.

		this.createToast = props.createToast.bind(this);
	}

	render()
	{
		const showcaseText = (this.props.isShowcaseMode) ? "Hide Community Showcase" : "Show Community Showcase";
		const showcase =
			<div className={"showcase-button"} onClick={(e) => {
				this.props.toggleShowcaseMode(e);
			}}>
				{showcaseText}
			</div>;

		let buttons = [
			<div className={"new-map-button"} onClick={(e) => {
				const userConfirmed = window.confirm("This will wipe your currently active map so that you can start from scratch.\n" +
					"You should save/export your map first if you wish to save your progress.\n\nDo you wish to continue?");
				if(userConfirmed) this.props.newMap(e);
			}}>
				New Map
			</div>,
			<div className={"save-button"} onClick={(e) => {
				this.props.openModal(e, <SaveModal handler={this.props.saveMap} activeMap={this.props.activeMap} createToast={this.props.createToast} />);
			}}>
				Save Map / Export
			</div>,
			<div className={"view-maps-button"} onClick={(e) => {
				this.props.openModal(e, <ViewMapsModal loadMap={this.props.loadMap} deleteMap={this.props.deleteMap}
				                                       activeUser={this.props.activeUser} openModal={this.props.openModal}
				                                       handleResponse={this.props.handleResponse}  />);
			}}>
				View Maps / Import
			</div>,
			<div className={"login-button"} onClick={(e) => {
				if(this.DATABASE_DISABLED)
				{
					this.createToast(null, "Feature currently unavailable due to a migration from PouchDB to MongoDB. Check back later!", 10000, "neutral");
				}
				else
				{
					this.props.openModal(e, <LoginRegisterModal mode={"login"} handler={this.props.authenticateUser} createToast={this.props.createToast} />);
				}
			}}>
				Log In
			</div>,
			<div className={"register-button"} onClick={(e) => {
				if(this.DATABASE_DISABLED)
				{
					this.createToast(null, "Feature currently unavailable due to a migration from PouchDB to MongoDB. Check back later!", 10000, "neutral");
				}
				else
				{
					this.props.openModal(e, <LoginRegisterModal mode={"register"} handler={this.props.registerUser} openModal={this.props.openModal} createToast={this.props.createToast} />);
				}
			}}>
				Register
			</div>
		];
		if(this.props.activeUser)
		{
			buttons = [
				<div className={"new-map-button"} onClick={(e) => {
					const userConfirmed = window.confirm("This will wipe your currently active map so that you can start from scratch.\n" +
						"You should save/export your map first if you wish to save your progress.\n\nDo you wish to continue?");
					if(userConfirmed) this.props.newMap(e);
				}}>
					New Map
				</div>,
				<div className={"save-button"} onClick={(e) => {
					this.props.openModal(e, <SaveModal handler={this.props.saveMap} activeMap={this.props.activeMap} createToast={this.props.createToast} />);
				}}>
					Save Map / Export
				</div>,
				<div className={"view-maps-button"} onClick={(e) => {
					this.props.openModal(e, <ViewMapsModal loadMap={this.props.loadMap} deleteMap={this.props.deleteMap}
					                                       activeUser={this.props.activeUser} openModal={this.props.openModal}
					                                       handleResponse={this.props.handleResponse}  />);
				}}>
					View Maps / Import
				</div>,
				<div className={"share-button"} onClick={(e) => {
					if(this.props.activeMap)
					{
						if(this.props.activeMap.mapID)
						{
							const domain = "https://lema-tool.herokuapp.com"; // Major TODO: Update this when hosted
							const link = `${domain}/map/${this.props.activeUser.username}/${this.props.activeMap.mapID}`;
							const linkModal =
								<GenericModal>
									<p>
										Here is the link to your map: <a href={link}>{link}</a><br /><br />
										This will not share your map to the showcase, but anybody with the link can access it.<br />
										Whenever you save your map, your changes will be shown via this same link.
									</p>
								</GenericModal>
							this.props.openModal(null, linkModal, true);
						}
						else
						{
							this.props.createToast(e, "Map must be saved to profile before it can be shared.", 7000, "error")
						}

					}
					else
					{
						this.props.createToast(e, "No active map. Create/load a map and save it to your profile before sharing.", 7000, "error")
					}

				}}>
					Share
				</div>,
				<div className={"settings-button"} onClick={(e) => {
					this.props.openModal(e, <ProfileSettingsModal editProfile={this.props.editProfile} deleteProfile={this.props.deleteProfile} activeUser={this.props.activeUser} createToast={this.props.createToast} />);
				}}>
					Profile Settings
				</div>,
				<div className={"logout-button"} onClick={this.props.logoutUser}>
					Log Out
				</div>
			];
		}

		return(
			<div className={"banner-container"}>
				<h2>LEMA: Linguistic Etymology Map Assistant</h2>
				<div className={"buttons-container"}>
					{showcase}
				</div>
				<div className={"buttons-container"}>
					{buttons}
				</div>
			</div>
		)
	}
}
