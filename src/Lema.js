import './css/Lema.css';
import {Component} from "react";
import {Banner} from "./components/Banner";
import {LeftBar} from "./components/LeftBar";
import {Map} from "./components/Map";

class Lema extends Component
{
  render()
  {
    return (
        <div className="Lema">
            <Banner />
            <div className={"main-view-container"}>
                <LeftBar />
                <Map />
            </div>
        </div>
    );
  }
}

export default Lema;
