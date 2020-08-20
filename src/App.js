import React, { Component } from 'react';
import './App.css';
import DataTable from "./components/index"
import { positions, Provider } from "react-alert";
import AlertTemplate from "react-alert-template-basic";

const options = {
  timeout: 5000,
  position: positions.BOTTOM_RIGHT
};

class App extends Component {
  render() {
    return (
      
      <div>    
        <Provider template={AlertTemplate} {...options}>  
          <DataTable/>
        </Provider>
      </div>
    );
  }
}

export default App;
