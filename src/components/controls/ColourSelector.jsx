import {Component} from "react";

export class ColourSelector extends Component
{
	constructor(props)
	{
		super(props);
		this.state = {
		};

		this.changeColourTimeout = null; // For throttling colour selector's onChange call rate
	}

	render()
	{
		return(
			<input name={this.props.name} type={"color"} defaultValue={this.props.value} onChange={(e) =>
			{
				// Throttle the onChange call rate
				const component = this;
				window.clearTimeout(this.changeColourTimeout);
				this.changeColourTimeout = window.setTimeout(function()
				{
					component.props.onChange(e);
				}, 100);
			}} />
		)
	}
}