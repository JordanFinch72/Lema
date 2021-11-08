import './Lema.css';
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
          <LeftBar />
          <Map />
        </div>
    );
  }
}

export default Lema;
