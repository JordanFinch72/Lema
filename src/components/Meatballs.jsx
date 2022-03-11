import {Component} from "react";
import {ContextMenu} from "./ContextMenu";
import {Button} from "./generic/Button";

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
			<Button className={"meatballs"} value={"..."} onClick={(e) =>
			{
				this.openContextMenu(e, <ContextMenu
					x={e.nativeEvent.clientX}  y={e.nativeEvent.clientY}
					items={this.state.contextMenuItems} closeContextMenu={this.closeContextMenu} />);
			}} />
		);
	}
}