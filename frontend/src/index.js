import './App.css';
import "./skeleton.scss";
import "react-toastify/dist/ReactToastify.css";
import "react-image-lightbox/style.css";
import 'font-awesome/css/font-awesome.min.css';

import { ApolloProvider } from "@apollo/client";
import { StrictMode } from "react";
import ReactDOM from "react-dom";
import ReactGA4 from "react-ga4";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import { CssVarsProvider } from "@mui/joy/styles";

import { client } from "./Apollo";
import App from "./App";
import { persistor, store } from "./Redux";
import Store from "./Store";

let { REACT_APP_NODE_ENV, REACT_APP_GOOGLE_ANALYTICS4 } = process.env
 
// replace console.* for disable log on production
if (REACT_APP_NODE_ENV === 'production') {
  console.log = () => {}
  console.error = () => {}
  console.debug = () => {}
}

// console.log("process.env :", process.env)

// const styleLink = document.createElement("link");
// styleLink.rel = "stylesheet";
// styleLink.href = "https://use.fontawesome.com/releases/v5.15.3/css/all.css";
// document.head.appendChild(styleLink);

ReactGA4.initialize(REACT_APP_GOOGLE_ANALYTICS4)
ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <StrictMode>
        <ApolloProvider client={client}>
          <Router>
            <Store>
              {/* <CssVarsProvider> */}
                <App />
              {/* </CssVarsProvider> */}
            </Store>
          </Router>
        </ApolloProvider>
      </StrictMode>
    </PersistGate>
  </Provider>,
  document.getElementById("root")
);
