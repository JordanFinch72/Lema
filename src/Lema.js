import "./css/Lema.css";
import {Component} from "react";
import {Banner} from "./components/Banner";
import {LeftBar} from "./components/LeftBar";
import {Map} from "./components/Map";
import {AddCollectionModal} from "./components/AddCollectionModal";

class Lema extends Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            activeModal: null // Either null or a React component
        };

        this.onManualAddClick = this.onManualAddClick.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    onManualAddClick(e, modalComponent)
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

	render()
	{
	    let modalContainer;
		if(this.state.activeModal !== null)
		{
			let activeModal = this.state.activeModal;
			modalContainer = <div className={"modal-container"}>{activeModal}</div>;
		}
		else
		{
			modalContainer = null;
		}


		return (
			<div className="Lema">
				<Banner/>
				<div className={"main-view-container"}>
					<LeftBar onManualAddClick={this.onManualAddClick} closeModal={this.closeModal} />
					<Map/>
				</div>
				{modalContainer}
			</div>
		);
	}
}

export default Lema;
