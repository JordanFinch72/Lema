import {Component} from "react";
import {ContextMenu} from "./ContextMenu";

export class Meatballs extends Component
{
	constructor(props)
	{
		super(props);
		this.state = {
			contextMenuItems: this.props.contextMenuItems
		};

		this.openContextMenu = this.props.openContextMenu.bind(this);
		this.closeContextMenu = this.props.closeContextMenu.bind(this);
	}

	render()
	{
		return (
			<div onClick={(e) =>
			{
				this.openContextMenu(e, <ContextMenu items={this.state.contextMenuItems} />);
			}}>
				...
			</div>
		);
	}
}