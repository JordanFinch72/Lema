import {Component} from "react";
import {Textbox} from "../controls/Textbox";
import {Button} from "../controls/Button";
import {LabeledControl} from "../controls/LabeledControl";
import {ColourPicker} from "../controls/ColourPicker";

export class LoginRegisterModal extends Component
{
	constructor(props)
	{
		super(props);
		this.state = {
			mode: this.props.mode, // "login" || "register"

			/* Login */
			loginUsername: "",
			loginPassword: "",
			rememberMe: false,

			/* Register */
			displayName: "",
			username: "",
			password: "",
			passwordConfirm: "",
			email: "",
			emailConfirm: "",
			dataConsent: false
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
		if(mode === "login")
		{
			// New user data
			const username = this.state.loginUsername;
			const password = this.state.loginPassword;

			// Client-side validation
			if(username === "")
				errorCollector += "Username missing.\n";
			if(password === "")
				errorCollector += "Password missing.\n";
		}
		else if(mode === "register")
		{
			// New user data
			const username = this.state.username;
			const displayName = this.state.displayName;
			const password = this.state.password;
			const passwordConfirm = this.state.passwordConfirm;
			const email = this.state.email;
			const emailConfirm = this.state.emailConfirm;

			// Client-side validation
			if(displayName.length < 3)
				errorCollector += "Display name too short (min. 3 characters).\n";
			if(displayName.length > 32)
				errorCollector += "Display name too long (max. 32 characters).\n";
			if(username.length < 3)
				errorCollector += "Username too short (min. 3 characters).\n";
			if(username.length > 32)
				errorCollector += "Username too long (max. 32 characters).\n";
			if(password.length < 6)
				errorCollector += "Password too short (min. 6 characters).\n";
			if(password !== passwordConfirm)
				errorCollector += "Passwords do not match.\n";
			if(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))
				errorCollector += "E-mail address invalid.\n";
			if(email !== emailConfirm)
				errorCollector += "E-mail addresses do not match.\n";
		}
		return (errorCollector === "");
	}

	render()
	{
		return (
			<div className={"modal"}>
				<div className={"top"}>
					{this.state.mode === "login" &&
						<div className={"left login"}>
							<h2>Login</h2>
							<div className={"login-register-data"}>
								<div className={"section"}>
									<div className={"form"}>
										<LabeledControl label={"Username: "}>
											<Textbox name={"loginUsername"} value={this.state.loginUsername} hint={""} onFieldChange={this.onFieldChange} />
										</LabeledControl>
										<LabeledControl label={"Password: "}>
											<Textbox name={"loginPassword"} isPassword={true} value={this.state.loginPassword} hint={""} onFieldChange={this.onFieldChange} />
										</LabeledControl>
										<LabeledControl label={"Remember me:"} tooltip={"This will set an essential cookie to keep you logged in."}>
											<input type={"checkbox"} name={"rememberMe"} checked={this.state.rememberMe} onChange={this.onFieldChange} />
										</LabeledControl>
									</div>
								</div>
							</div>
						</div>
					}
					{this.state.mode === "register" &&
						<div className={"left register"}>
							<h2>Register</h2>
							<div className={"login-register-data"}>
								<div className={"section"}>
									<h4>User Data</h4>
									<div className={"form"}>
										<LabeledControl label={"Display name: "}>
											<Textbox name={"displayName"} value={this.state.displayName} hint={"e.g. \"Jordan F.\""} onFieldChange={this.onFieldChange} />
										</LabeledControl>
										<LabeledControl label={"Username: "} tooltip={"Min. 3 characters.\nMax. 32 characters."}>
											<Textbox name={"username"} value={this.state.username} hint={"e.g. \"JordanFinch72\""} onFieldChange={this.onFieldChange} />
										</LabeledControl>
										<LabeledControl label={"Password: "} tooltip={"Min. 6 characters"}>
											<Textbox name={"password"} isPassword={true} value={this.state.password} hint={""} onFieldChange={this.onFieldChange} />
										</LabeledControl>
										<LabeledControl label={"Password (confirm): "}>
											<Textbox name={"passwordConfirm"} isPassword={true} value={this.state.passwordConfirm} hint={""} onFieldChange={this.onFieldChange} />
										</LabeledControl>
										<LabeledControl label={"E-mail address: "}>
											<Textbox name={"email"} value={this.state.email} hint={"e.g. \"lema@jordanfinch.dev\""} onFieldChange={this.onFieldChange} />
										</LabeledControl>
										<LabeledControl label={"E-mail address (confirm): "}>
											<Textbox name={"emailConfirm"} value={this.state.emailConfirm} onFieldChange={this.onFieldChange} />
										</LabeledControl>
									</div>
								</div>
								<div className={"section"}>
									<h4>Legal Stuff</h4>
									<div className={"form"}>
										<p>By ticking this box, you agree that your user data will be used in accordance with the <a href={"#"} target={"_blank"}>privacy policy</a>.</p>
										<input type={"checkbox"} name={"dataConsent"} checked={this.state.dataConsent} onChange={this.onFieldChange} />
									</div>
								</div>
							</div>
						</div>
					}
				</div>
				<div className={"bottom"}>
					<div className={"buttons-container"}>
						<Button value={"Submit"} id={"add-collection-modal-submit"} onClick={(e) =>
						{
							if(this.validate(this.state.mode))
							{
								this.props.handler(e, this.state);
							}
						}}/>
					</div>
				</div>
			</div>
		);
	}
}