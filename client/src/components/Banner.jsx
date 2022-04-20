import {Component} from "react";
import {LoginRegisterModal} from "./modals/LoginRegisterModal";

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
				Login
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
				<div className={"showcase-button"}>
					Community Showcase
				</div>
			];
		}

		return(
			<div className={"banner-container"}>
				<h2>LEMA: Linguistic Etymology Map Assistant</h2>
				<p>{text}</p>
				<div className={"buttons-container"}>
					{buttons}
				</div>
			</div>
		)
	}
}