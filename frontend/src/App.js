import logo from './logo.svg';
import './App.css';

import React, { useState, useEffect, useRef, useCallback} from "react";
import { useQuery, useSubscription } from "@apollo/client";
import moment from "moment";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useHistory,
  Link,
  useLocation
} from "react-router-dom";
import { connect } from "react-redux";

import { getHeaders } from "./util"
import { gqlPing, subscriptionMe } from "./gqlQuery"


import LoginPage from "./LoginPage"
import HomePage from "./HomePage";
import DetailPage from "./DetailPage";
import SuppliersPage from "./SuppliersPage";
import SupplierPage from "./SupplierPage";


import PrivateRoute from "./PrivateRoute"
import PrivatePage from "./PrivatePage"

const App =(props) =>{
  const intervalPing = useRef(null);

  let { user } = props

  /////////////////////// ping ///////////////////////////////////
  const pingValues =useQuery(gqlPing, { context: { headers: getHeaders() }, notifyOnNetworkStatusChange: true});


  // const meValue = useSubscription(subscriptionMe, {userId: "xxxx"}, { context: { headers: getHeaders() } } )
  // console.log("meValue :", meValue)

  useSubscription(subscriptionMe, {
    onSubscriptionData: useCallback((res) => {
      console.log("subscriptionMe :", res)
    }, []),
    onError: useCallback((err) => {
      console.log("subscriptionMe :", err)
    }, []),
    variables: {sessionId: localStorage.getItem('token')},
  });

  useEffect(()=> {
    intervalPing.current = setInterval(() => {
      pingValues && pingValues.refetch()
        
      console.log("ping, auth : ", moment().format("DD-MM-YYYY hh:mm:ss") )
    }, 20000);
    return ()=> clearInterval(intervalPing.current);
  }, []);


  return (
      <div className="App">
        <div className="container">
          <div className="row">
            <Switch>
              <Route path="/" exact>
                <div className="page-home">
                  <HomePage />
                </div>
              </Route>

              <Route path="/detail">
                <div className="page-dev pl-2 pr-2">
                  <DetailPage />
                </div>
              </Route>

              <Route path="/user/login">
                <LoginPage />
              </Route>

              <Route path="/suppliers">
                <SuppliersPage />
              </Route>

              <Route path="/supplier">
                <SupplierPage />
              </Route>

              <PrivateRoute path="/">
                <PrivatePage />
              </PrivateRoute>   

              {/*
              <Route path="/detail/:id">
                <div className="page-detail">
                  <Detail/>
                </div>
              </Route>
              <Route path="/user/:id/view">
                <div className="page-view">
                  <UserView />
                </div>
              </Route>
              <Route path="/help">
                <div className="page-help pl-2 pr-2">
                  <Help />
                </div>
              </Route>
              <Route path="/privacy+terms">
                <div className="page-terms pl-2 pr-2">
                  <PrivacyAndTermsPage />
                </div>
              </Route>
              <Route path="/developer">
                <div className="page-dev pl-2 pr-2">
                  <DeveloperPage />
                </div>
              </Route>
              <Route path="/pdpa">
                <div className="page-dev pl-2 pr-2">
                  <Pdpa />
                </div>
              </Route>
              <PrivateRoute path="/">
                <PrivatePage />
              </PrivateRoute>   
              <Route path="*">
                <NoMatch />
              </Route>      */}
            </Switch>
          </div>
        </div>
      </div>
  );
}

// export default App;
const mapStateToProps = (state, ownProps) => {
  return { user:state.auth.user }
};

const mapDispatchToProps = {}
export default connect( mapStateToProps, mapDispatchToProps )(App);
