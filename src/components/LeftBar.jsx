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
		this.openModal = this.props.openModal.bind(this);
		this.closeModal = this.props.closeModal.bind(this);
		this.openContextMenu = this.props.openContextMenu.bind(this);
		this.closeContextMenu = this.props.closeContextMenu.bind(this);
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
				<Collections mapMode={this.state.mapMode} openModal={this.openModal} closeModal={this.closeModal} openContextMenu={this.openContextMenu} closeContextMenu={this.closeContextMenu} />
			</div>
		);
	}
}