import {Component} from "react";
import {Search} from "./Search";
import {Collections} from "./Collections";

export class LeftBar extends Component
{
	constructor(props)
	{
		super(props);
		this.state = {
			mapMode: "cognate" // "cognate" || "journey"
		};

		this.updateMapMode = this.updateMapMode.bind(this);
	}

	updateMapMode(e, mode)
	{
		this.setState({mapMode: mode});
	}

	render()
	{
		return(
			<div className={"left-bar-container"}>
				<Search mapMode={this.state.mapMode} updateMapMode={this.updateMapMode} />
				<Collections mapMode={this.state.mapMode} />
			</div>
		);
	}
}