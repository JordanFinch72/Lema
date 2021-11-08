import {Component} from "react";

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
			<div onClick={(e) => this.toggleCollapse(e)}>
				<span>{symbol}</span>
			</div>
		)
	}
}