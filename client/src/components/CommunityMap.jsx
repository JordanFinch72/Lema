import React, {Component} from "react";
import {Meatballs} from "./controls/Meatballs";
import {Collapser} from "./controls/Collapser";
import {AddEditCollectionModal} from "./modals/AddEditCollectionModal";
import {AddEditNodeModal} from "./modals/AddEditNodeModal";
import {Button} from "./controls/Button";

export class CommunityMap extends Component
{
	constructor(props)
	{
		super(props);
	}

	render()
	{
		return (
			<div className={"community-map"} onClick={(e) => {
				// TODO: Load the map (equivalent to opening its link)
				const mapID = this.props.mapID, username = this.props.owner;
				const userConfirmed = window.confirm("Load this map? This will overwrite your active map.\nYou may wish to save your own map first.\n\n" +
					"Do you with to continue?");

				if(userConfirmed) window.location.href = `/map/${username}/${mapID}`;
			}}>
				{/* Flex-row */}
				<div onClick={(e) =>
				{
					// TODO: Consider revealing the full title (if clipped)
				}}>{this.props.title}</div>
				<div onClick={(e) =>
				{
					// TODO: Consider revealing the full description (if clipped)
				}}>{this.props.description}</div>
				<div onClick={(e) =>
				{
					// TODO: Search for all maps by this owner
				}}>{this.props.owner}</div>
			</div>
		);
	}
}