// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import './index.css';
// import App from './App';
// import reportWebVitals from './reportWebVitals';

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );

// // If you want to start measuring performance in your app, pass a function
// // to log results (for example: reportWebVitals(console.log))
// // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();

import './index.css';

import { StrictMode } from "react";
import ReactDOM from "react-dom";
import ReactGA4 from "react-ga4";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ApolloProvider } from "@apollo/client";
import { setContext } from '@apollo/client/link/context';

import { BrowserRouter as Router } from "react-router-dom";

import { store, persistor } from "./Redux"
import { client } from "./Apollo"
import App from "./App";
import Store from "./Store";

let { REACT_APP_NODE_ENV, REACT_APP_GOOGLE_ANALYTICS4 } = process.env
 
// replace console.* for disable log on production
if (REACT_APP_NODE_ENV === 'production') {
  console.log = () => {}
  console.error = () => {}
  console.debug = () => {}
}

ReactGA4.initialize(REACT_APP_GOOGLE_ANALYTICS4)
ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <StrictMode>
        <ApolloProvider client={client}>
          <Router>
            <Store>
              <App />
            </Store>
          </Router>
        </ApolloProvider>
      </StrictMode>
    </PersistGate>
  </Provider>,
  document.getElementById("root")
);
