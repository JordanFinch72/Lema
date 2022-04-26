import {Component} from "react";
import {Textbox} from "../controls/Textbox";
import {Button} from "../controls/Button";
import {LabeledControl} from "../controls/LabeledControl";

export class ProfileSettingsModal extends Component
{
	constructor(props)
	{
		super(props);
		this.state = {
			displayName: (this.props.activeUser) ? (this.props.activeUser.displayName) : ""
		};

		this.onFieldChange = this.onFieldChange.bind(this);
		this.validate = this.validate.bind(this);
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
	 * Validates form data.
	 * @param mode Whether to validate login or register data
	 * @returns {boolean}
	 */
	validate(mode)
	{
		let errorCollector = "";

		// New user data
		const displayName = this.state.displayName;

		// Client-side validation
		if(displayName.length < 3)
			errorCollector += "Display name too short (min. 3 characters).\n";
		if(displayName.length > 32)
			errorCollector += "Display name too long (max. 32 characters).\n";

		if(errorCollector !== "")
		{
			alert(errorCollector); // TODO: Proper response toasts
			return false;
		}
		else return true;
	}

	render()
	{
		return (
			<div className={"modal"}>
				<div className={"top"}>
					<div className={"left profile-settings"}>
						<h2>Profile Settings</h2>
						<div className={"profile-settings-data"}>
							<div className={"section"}>
								<h4>User Data</h4>
								<div className={"form"}>
									<LabeledControl label={"Display name: "}>
										<Textbox name={"displayName"} value={this.state.displayName} hint={"e.g. \"Jordan F.\""} autoFocus={true} onFieldChange={this.onFieldChange} />
									</LabeledControl>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className={"bottom"}>
					<div className={"buttons-container"}>
						<Button value={"Submit"} onClick={(e) =>
						{
							if(this.validate(this.state.mode))
							{
								this.props.editProfile(e, this.state);
							}
						}}/>
						<Button value={"DELETE ACCOUNT"} onClick={(e) =>
						{
							const userConfirmed = window.confirm("This will permanently delete your profile and ALL of your saved maps - even the ones on the public showcase!\n" +
								"This cannot be undone.\n\nDo you wish to proceed and permanently delete your profile?");
							if(userConfirmed)
								this.props.deleteProfile(e);
						}}/>
					</div>
				</div>
			</div>
		);
	}
}