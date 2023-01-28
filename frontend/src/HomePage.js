import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import CircularProgress from '@mui/material/CircularProgress';
import { useQuery, useMutation, useApolloClient } from "@apollo/client";

import _ from "lodash"

import { gqlSuppliers, subscriptionSuppliers, mutationMe } from "./gqlQuery"
import { getHeaders, checkRole } from "./util"
import { AMDINISTRATOR, AUTHENTICATED } from "./constants"
import { logout } from "./redux/actions/auth"

let unsubscribeSuppliers = null;
const HomePage = (props) => {
  let history = useHistory();
  let { t } = useTranslation();

  let { user, logout } = props

  useEffect(()=>{
    return () => {
      unsubscribeSuppliers && unsubscribeSuppliers()
    };
  }, [])

  // const meValues =useQuery(gqlMe, {
  //   context: { headers: getHeaders() },
  //   variables: {},
  //   notifyOnNetworkStatusChange: true,
  // });
  // console.log("meValues :", meValues )

  const [onMe, resultMeValues] = useMutation(mutationMe,{
    context: { headers: getHeaders() },
    update: (cache, {data: {me}}) => {
      console.log("onMe :", me)
    },
    onCompleted({ data }) {
      console.log("onCompleted")
    },
    onError: (err) => {
      console.log("onError :", err)
    }
  });
  

  const suppliersValues =useQuery(gqlSuppliers, {
    context: { headers: getHeaders() },
    // variables: { page, perPage: rowsPerPage, keywordSearch: keywordSearch, category: category.join()},
    variables: {},
    notifyOnNetworkStatusChange: true,
  });
  console.log("suppliersValues :", suppliersValues )

  if(suppliersValues.loading){
    return <div><CircularProgress /></div>
  }else{
    if(_.isEmpty(suppliersValues.data.getSuppliers)){
      return;
    }

    let {subscribeToMore, networkStatus} = suppliersValues
    let keys = _.map(suppliersValues.data.getSuppliers.data, _.property("_id"));
    
    unsubscribeSuppliers && unsubscribeSuppliers()
    unsubscribeSuppliers =  subscribeToMore({
			document: subscriptionSuppliers,
      variables: { supplierIds: JSON.stringify(keys) },
			updateQuery: (prev, {subscriptionData}) => {        
        if (!subscriptionData.data) return prev;

        let { mutation, data } = subscriptionData.data.subscriptionSuppliers;
        switch(mutation){
          case "BOOK":
          case "UNBOOK":{
            let newData = _.map((prev.getSuppliers.data), (item)=> item._id == data._id ? data : item )

            let newPrev = {...prev.getSuppliers, data: newData}
            return {getSuppliers: newPrev}; 
          }
          default:
            return prev;
        }
			}
		});
  }

  console.log("checkRole :", checkRole(user), user)

  const managementView = () =>{
    switch(checkRole(user)){
      case AMDINISTRATOR:{
        return  <div>
                  <div>AMDINISTRATOR : {user.displayName} - {user.email} > Balance : {user.balance}</div>
                  <div>
                  <button onClick={()=>{
                    history.push("/me");
                  }}>Profile</button>
                  <button onClick={()=>{ onMe() }}>refetch</button>
                  {/* <button onClick={()=>{ history.push("/banks"); }}>จัดการ รายชือธนาคาร</button> */}
                  </div>
                </div>
      }

      case AUTHENTICATED:{
        return  <div>
                  <div>AUTHENTICATED : {user.displayName} - {user.email} > Balance : {user.balance}</div>
                  <div>
                  <button onClick={()=>{
                    history.push("/me");
                  }}>Profile</button>
                    <button onClick={()=>{
                      onMe()
                    }}>refetch</button>
                  </div>
                </div>
      }
      
      default:{
        return  <div>
                  <div>ANONYMOUS</div>
                  <div>
                    <button onClick={()=>{
                      history.push("/user/login");
                    }}>Login</button>
                     <button onClick={()=>{
                      onMe()
                    }}>refetch</button>
                  </div>
                 
                </div>
      }
    }
  }

  const bookView = (val) =>{
    let fn = _.filter(val.buys, (buy)=> buy.selected == 0 );
    console.log("val :", val, fn)

    return fn.length;
  }

  const sellView = (val) =>{
    let fn = _.filter(val.buys, (buy)=> buy.selected == 1 );
    console.log("val :", val, fn)

    return fn.length;
  }

  return (<div style={{flex:1}}>
            {managementView()}
            {
              _.map(suppliersValues.data.getSuppliers.data, (val, k)=>{
                return  <div className="home-item"
                          onClick={(evt)=>{
                            history.push({
                              pathname: "/detail",
                              // search: "?id=5",
                              // hash: "#react",
                              state: { id: val._id }
                            });
                          }}>
                          <div>{val.title}</div>
                          <div>จอง :{bookView(val)}</div>
                          <div>ขายไปแล้ว :{sellView(val)}</div>
                        </div>
              })
            }
          </div>);
}

const mapStateToProps = (state, ownProps) => {
  return { user:state.auth.user }
};

const mapDispatchToProps = { logout }
export default connect( mapStateToProps, mapDispatchToProps )(HomePage);