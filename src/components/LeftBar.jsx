import {Component} from "react";
import {ControlBox} from "./ControlBox";
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
		this.onManualAddClick = this.props.onManualAddClick.bind(this);
		this.closeModal = this.props.closeModal.bind(this);
	}

	updateMapMode(e, mode)
	{
		this.setState({mapMode: mode});
	}

	render()
	{
		return(
			<div className={"left-bar-container"}>
				<ControlBox mapMode={this.state.mapMode} updateMapMode={this.updateMapMode} />
				<Collections mapMode={this.state.mapMode} onManualAddClick={this.onManualAddClick} closeModal={this.closeModal} />
			</div>
		);
	}
}