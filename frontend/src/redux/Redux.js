//////////////// redux /////////////////
import { applyMiddleware, legacy_createStore as createStore, compose  } from "redux";
import thunk from "redux-thunk";
import { createLogger } from "redux-logger";    // Logger with default options

// persist
import { persistStore, persistReducer, createTransform } from "redux-persist";
import storage from "redux-persist/lib/storage";
import CryptoJS from 'crypto-js';

import reducers from "./reducers";

let { REACT_APP_NODE_ENV, REACT_APP_ENCRYPT_PASS } = process.env

const encrypt = createTransform(
  (inboundState, key) => {
    if (!inboundState) return inboundState;
    const cryptedText = CryptoJS.AES.encrypt(JSON.stringify(inboundState), REACT_APP_ENCRYPT_PASS);

    return cryptedText.toString(); 
  },
  (outboundState, key) => {
    if (!outboundState) return outboundState;
    const bytes = CryptoJS.AES.decrypt(outboundState, REACT_APP_ENCRYPT_PASS);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    return JSON.parse(decrypted);
  },
);

let persistConfig = { key: "root", storage };

// https://stackoverflow.com/questions/45137911/react-native-persist-and-encrypt-user-token-redux-persist-transform-encrypt-er
if(REACT_APP_NODE_ENV === 'production'){
  persistConfig = {
    key: "root",
    storage,
    // {
    //   storage: AsyncStorage,
    //   whitelist: ['auth'], // <-- keys from state that should be persisted
    //   transforms: [encrypt],
    // },
    transforms: [encrypt],
  };
}

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