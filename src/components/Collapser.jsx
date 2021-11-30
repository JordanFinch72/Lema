import {Component} from "react";
import {Button} from "./Button";

export class Collapser extends Component
{
	constructor(props)
	{
		super(props);
		this.toggleCollapse = this.props.toggleCollapse.bind(this);
	}

	render()
	{
		let symbol = (this.props.collapsed) ? ">" : "V"

		return(
			<Button value={symbol} id={"collapser"} onClick={(e) => this.toggleCollapse(e)} />
		)
	}
}