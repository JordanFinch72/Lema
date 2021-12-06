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
		this.addCollection = this.props.addCollection.bind(this);
		this.editCollection = this.props.editCollection.bind(this);
		this.addNode = this.props.addNode.bind(this);
		this.editNode = this.props.editNode.bind(this);
		this.editNodeColour = this.props.editNodeColour.bind(this);
		this.removeNode = this.props.removeNode.bind(this);
	}

	updateMapMode(e, mode)
	{
		this.setState({mapMode: mode});
	}

	render()
	{
		return (
			<div className={"left-bar-container"}>
				<ControlBox mapMode={this.state.mapMode} updateMapMode={this.updateMapMode}/>
				<Collections items={this.props.items}
				             mapMode={this.state.mapMode} openModal={this.openModal} closeModal={this.closeModal}
				             openContextMenu={this.openContextMenu} closeContextMenu={this.closeContextMenu}
				             addNode={this.addNode} editNode={this.editNode} editNodeColour={this.editNodeColour} removeNode={this.removeNode}
				             addCollection={this.addCollection} editCollection={this.editCollection}
				/>
			</div>
		);
	}
}