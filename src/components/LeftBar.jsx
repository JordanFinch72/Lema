import {Component} from "react";
import {Search} from "./Search";
import {Collections} from "./Collections";

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
		return(
			<div>
				<Search />
				<Collections />
			</div>
		);
	}
}