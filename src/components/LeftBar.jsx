import {Component} from "react";
import {ControlBox} from "./ControlBox";
import {CollectionArea} from "./CollectionArea";

export class LeftBar extends Component
{
	constructor(props)
	{
		super(props);
		this.state = {

		};

	}

	render()
	{
		return (
			<div className={"left-bar-container"}>
				<ControlBox addJourneyFromDatabase={this.props.addJourneyFromDatabase} />
				<CollectionArea collections={this.props.collections}
				                mapMode={this.state.mapMode} openModal={this.props.openModal} closeModal={this.props.closeModal}
				                openContextMenu={this.props.openContextMenu} closeContextMenu={this.props.closeContextMenu}
				                addNode={this.props.addNode} editNode={this.props.editNode} editNodeColour={this.props.editNodeColour} removeNode={this.props.removeNode}
				                addCollection={this.props.addCollection} editCollection={this.props.editCollection} removeCollection={this.props.removeCollection}
				/>
			</div>
		);
	}
}