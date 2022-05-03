import {Component} from "react";
import {Textbox} from "../controls/Textbox";
import {Button} from "../controls/Button";
import {LabeledControl} from "../controls/LabeledControl";
import {GenericModal} from "./GenericModal";

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
			const dataConsent = this.state.dataConsent;
			if(!dataConsent)
			{
				errorCollector += "You must agree to the privacy policy to create a profile.";
			}
			else
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
				if(!email.match(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/))
					errorCollector += "E-mail address invalid.\n";
				if(email !== emailConfirm)
					errorCollector += "E-mail addresses do not match.\n";
			}
		}
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
					{this.state.mode === "login" &&
						<div className={"left login"}>
							<h2>Login</h2>
							<div className={"login-register-data"}>
								<div className={"section"}>
									<div className={"form"}>
										<LabeledControl label={"Username: "}>
											<Textbox name={"loginUsername"} value={this.state.loginUsername} hint={""} autoFocus={true} onFieldChange={this.onFieldChange} />
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
											<Textbox name={"displayName"} value={this.state.displayName} hint={"e.g. \"Jordan F.\""} autoFocus={true} onFieldChange={this.onFieldChange} />
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
										<p>By ticking this box, you agree that your user data will be used in accordance with the <a href={"#"} onClick={(e) => {
											const privacyPolicy =
											<GenericModal>
												<main>
													<h1>Data & Privacy Policy</h1>
													<p>This privacy policy details how the software Linguistic Etymology Map Assistant (LEMA) will handle private and/or personal user data submitted to it.</p>
													<section>
														<h2>User Data</h2>
														<ul>
															<li>Any personally-identifiable data (PID) submitted to LEMA will be secured and encrypted using HTTPS/SSL protocols during its passage from client to server.</li>
															<li>Passwords submitted to LEMA will be appropriately secured by the server before being stored in any database.</li>
															<li>No user data will <b>ever</b> be shared with any third party and will be used <b>solely</b> for the functions of LEMA itself.</li>
														</ul>
													</section>
													<section>
														<h2>Cookies</h2>
														<ul>
															<li>LEMA uses <i>localStorage</i> cookies to: (1) keep you logged in; (2) auto-save your active maps and their collections so that you do not lose work by closing the app.</li>
															<li>localStorage use (1) is opt-in and this cookie can be avoided by not ticking the "Remember me" box when you log in. If you have already done so, logging out will delete the cookie.</li>
															<li>localStorage use (1) is an essential cookie for the proper function of this app. There is currently no way to opt out. If you feel that this option would be important, please contact me.</li>
														</ul>
													</section>
													<section>
														<h2>Community Showcase</h2>
														<ul>
															<li>Any maps shared on the Community Showcase will have all of their data - in addition to the username and display name of the map owner - exposed to all other users of LEMA.</li>
															<li>If you wish your map to no longer be shared on the Community Showcase, you may load the map and then re-save it with the "Share to showcase" box unticked.</li>
														</ul>
													</section>
												</main>
											</GenericModal>
											this.props.openModal(e, privacyPolicy, true);
										}}>privacy policy</a>.</p>
										<input type={"checkbox"} name={"dataConsent"} checked={this.state.dataConsent} onChange={this.onFieldChange} />
									</div>
								</div>
							</div>
						</div>
					}
				</div>
				<div className={"bottom"}>
					<div className={"buttons-container"}>
						<Button value={"Submit"} onClick={(e) =>
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