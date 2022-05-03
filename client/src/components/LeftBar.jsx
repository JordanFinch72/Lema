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
				<ControlBox addJourneyFromDatabase={this.props.addJourneyFromDatabase} isShowcaseMode={this.props.isShowcaseMode} createToast={this.props.createToast} />
				<CollectionArea activeMap={this.props.activeMap} collections={this.props.collections}
				                isShowcaseMode={this.props.isShowcaseMode} createToast={this.props.createToast}
				                mapMode={this.state.mapMode} openModal={this.props.openModal} closeModal={this.props.closeModal}
				                openContextMenu={this.props.openContextMenu} closeContextMenu={this.props.closeContextMenu}
				                addNode={this.props.addNode} editNode={this.props.editNode} removeNode={this.props.removeNode}
				                addCollection={this.props.addCollection} editCollection={this.props.editCollection} removeCollection={this.props.removeCollection}
				/>
			</div>
		);
	}
}