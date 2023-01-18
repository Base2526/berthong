import logo from './logo.svg';
import './App.css';

import React, { useState, useEffect, useRef} from "react";
import { useQuery, useApolloClient } from "@apollo/client";
import moment from "moment";

import { getHeaders } from "./util"
import { gqlPing } from "./gqlQuery"

const App =(props) =>{
  const intervalPing = useRef(null);

  /////////////////////// ping ///////////////////////////////////
  const pingValues =useQuery(gqlPing, { context: { headers: getHeaders() }, notifyOnNetworkStatusChange: true});

  useEffect(()=> {
    intervalPing.current = setInterval(() => {
      pingValues && pingValues.refetch()
        
      console.log("ping, auth : ", moment().format("DD-MM-YYYY hh:mm:ss") )
    }, 20000);
    return ()=> clearInterval(intervalPing.current);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
