//////////////// redux /////////////////
import { applyMiddleware, legacy_createStore as createStore, combineReducers, compose  } from "redux";
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from "react-redux";
import thunk from "redux-thunk";
import { createLogger } from "redux-logger";    // Logger with default options

// persist
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { PersistGate } from "redux-persist/integration/react";
import { BrowserRouter, Switch } from "react-router-dom";

import ReactGA4 from "react-ga4";

import reducers from "./redux/reducers";

const persistConfig = {
  key: "root",
  storage,
};

const reducer = persistReducer(persistConfig, reducers);
// persist

// https://github.com/LogRocket/redux-logger/issues/6
const logger = createLogger({
  predicate: () => process.env.REACT_APP_NODE_ENV !== "development",
});

let middleware = [];
if (process.env.REACT_APP_NODE_ENV === 'development') {
  middleware = [...middleware, thunk, logger];
} else {
  middleware = [...middleware, thunk];
}

// thunk
const store = createStore(reducer, compose(applyMiddleware(...middleware)) /*applyMiddleware(thunk, logger)*/);
const persistor = persistStore(store);
//////////////// redux /////////////////

export {store, persistor};