import './App.css';
import React, { useEffect, useRef, useCallback} from "react";
import { useApolloClient, useQuery, useSubscription } from "@apollo/client";
import moment from "moment";
import { Switch, Route, useLocation } from "react-router-dom";
import { connect } from "react-redux";
import _ from "lodash"

import { getHeaders } from "./util"
import { gqlPing, subscriptionMe, querySuppliers, querySupplierById } from "./gqlQuery"
import { editedUserBalace, editedUserBalaceBook } from "./redux/actions/auth"
import LoginPage from "./LoginPage"
import HomePage from "./HomePage";
import DetailPage from "./DetailPage";
import SuppliersPage from "./SuppliersPage";
import SupplierPage from "./SupplierPage";
import SupplierProfilePage from "./SupplierProfilePage";
import PrivateRoute from "./PrivateRoute"
import PrivatePage from "./PrivatePage"

const App =(props) =>{
  let client = useApolloClient();
  let location = useLocation();
  let intervalPing = useRef(null);

  let { user, editedUserBalace, editedUserBalaceBook } = props

  /////////////////////// ping ///////////////////////////////////
  const pingValues =useQuery(gqlPing, { context: { headers: getHeaders(location) }, notifyOnNetworkStatusChange: true});


  useSubscription(subscriptionMe, {
    onSubscriptionData: useCallback((res) => {
      console.log("subscriptionMe :", res)
      if(!res.subscriptionData.loading){
        let { mutation, data } = res.subscriptionData.data.subscriptionMe

        switch(mutation){
          case "DEPOSIT":
          case "WITHDRAW":
          case "BUY":{
            editedUserBalace(data)
            break;
          }

          case "BOOK":{
            editedUserBalaceBook(data)
            break;
          }
        }
      }
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

      /*
      const suppliersValue = client.readQuery({ query: querySuppliers });
      if(!_.isNull(suppliersValue)){
        let { status, data } = suppliersValue.suppliers
        let newData = _.map(data, (item)=>{
                        let { buys } = item

                        let newBuys = _.transform(
                          buys,
                          (result, n) => {
                            var now = moment(new Date()); //todays date
                            var end = moment(n.createdAt); // another date
                            var duration = moment.duration(now.diff(end));

                            console.log("duration :", duration.asMinutes(), duration.asHours())
                            
                            if( duration.asHours() <= 1 || n.selected == 1) {
                              result.push(n);
                            }
                          },
                          []
                        );

                        if(!_.isEqual(newBuys, buys)){

                          let newItem = {...item, buys: newBuys}

                          let supplierByIdValue = client.readQuery({ query: querySupplierById, variables: {id: item._id}});
                          if(!_.isNull(supplierByIdValue)){
                            console.log("supplierByIdValue :", supplierByIdValue, newItem)

                            client.writeQuery({  query: querySupplierById, 
                                                data: { supplierById: {...supplierByIdValue.supplierById, data: newItem } }, 
                                                variables: { id: item._id } 
                                            }); 
                          }
                          
                          return newItem
                        }
                        return item
                      })

        if(!_.isEqual(data, newData)){
          client.writeQuery({
            query: querySuppliers,
            data: { suppliers: {...suppliersValue.suppliers, data: newData} }
          });
        }
      }
      
      */
      
    }, 60000 /*1 min*/);
    return ()=> clearInterval(intervalPing.current);
  }, []);


  return (
      <div className="App">
        <div className="container">
          <div className="row">
            <Switch>
              <Route path="/" exact>
                <HomePage />
              </Route>
              <Route path="/p">
                <DetailPage />
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
              <Route path="/profile">
                <SupplierProfilePage />
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

const mapDispatchToProps = {
  editedUserBalace,
  editedUserBalaceBook
}
export default connect( mapStateToProps, mapDispatchToProps )(App);
