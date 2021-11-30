import "./css/Lema.css";
import {Component} from "react";
import {Banner} from "./components/Banner";
import {LeftBar} from "./components/LeftBar";
import {Map} from "./components/Map";
import {AddEditCollectionModal} from "./components/AddEditCollectionModal";

class Lema extends Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            activeModal: null, // Either null or a React component
	        activeContextMenu: null // Either null or a React component
        };

        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
	    this.openContextMenu = this.openContextMenu.bind(this);
	    this.closeContextMenu = this.closeContextMenu.bind(this);
    }

    openModal(e, modalComponent)
    {
        this.setState({
            activeModal: modalComponent
        });
    }
	closeModal()
	{
		this.setState({
			activeModal: null
		});
	}
	openContextMenu(e, menuComponent)
	{
		this.setState({
			activeContextMenu: menuComponent
		});
	}
	closeContextMenu()
	{
		this.setState({
			activeContextMenu: null
		});
	}

	render()
	{
	    let modalContainer = null, contextMenuContainer = null;
		if(this.state.activeModal !== null)
		{
			let activeModal = this.state.activeModal;
			modalContainer = <div className={"modal-container"} onClick={(e) => {
				if(e.nativeEvent.target.className === "modal-container") this.closeModal(); // Closes modal if they click off the modal
			}} >{activeModal}</div>;
		}
		if(this.state.activeContextMenu !== null)
		{
			let activeContextMenu = this.state.activeContextMenu;
			contextMenuContainer = <div className={"context-menu-container"} onClick={this.closeContextMenu}>{activeContextMenu}</div>;
		}




		return (
			<div className="Lema">
				<Banner/>
				<div className={"main-view-container"}>
					<LeftBar openModal={this.openModal} closeModal={this.closeModal} openContextMenu={this.openContextMenu} closeContextMenu={this.closeContextMenu} />
					<Map/>
				</div>
				{modalContainer}
				{contextMenuContainer}
			</div>
		);
	}
}

export default Lema;
