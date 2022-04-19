import {Component} from "react";

export class Banner extends Component
{
	constructor(props)
	{
		super(props);
	}

	render()
	{
		return(
			<div className={"banner-container"}>
				<h2>LEMA: Linguistic Etymology Map Assistant</h2>
				<div className={"login-register-container"}>
					<div className={"login-button"}>
						Login
					</div>
					<div className={"register-button"}>
						Register
					</div>
				</div>
			</div>
		)
	}
}