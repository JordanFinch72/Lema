import {Component} from "react";

export class ContextMenu extends Component
{
	constructor(props)
	{
		super(props);
		this.state = {
			x: this.props.x,
			y: this.props.y,
			items: [
				...this.props.items,
				{text: "Close", handler: this.closeContextMenu}
			]
		};

		this.closeContextMenu = this.props.closeContextMenu.bind(this);
	}


	render()
	{
		let items = this.state.items.map((item, index) => {
			return <div className={"context-menu-item"} onClick={item.handler} key={index}>item.text</div>;
		});

		return (
			<div className={"context-menu"} style={{"left": this.state.x, "top": this.state.y}}>
				{items}
			</div>
		);
	}
}