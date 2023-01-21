import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import CircularProgress from '@mui/material/CircularProgress';
import { useQuery, useMutation, useApolloClient } from "@apollo/client";

import _ from "lodash"

import { gqlSuppliers } from "./gqlQuery"
import { getHeaders, checkRole } from "./util"
import { AMDINISTRATOR, AUTHENTICATED, ANONYMOUS } from "./constants"
import { logout } from "./redux/actions/auth"

const HomePage = (props) => {
  let history = useHistory();
  let { t } = useTranslation();

  let { user, logout } = props

  const suppliersValues =useQuery(gqlSuppliers, {
    context: { headers: getHeaders() },
    // variables: { page, perPage: rowsPerPage, keywordSearch: keywordSearch, category: category.join()},
    variables: {},
    notifyOnNetworkStatusChange: true,
  });
  console.log("suppliersValues :", suppliersValues )

  if(suppliersValues.loading){
    return <div><CircularProgress /></div>
  }

  console.log("checkRole :", checkRole(user), user)

  const managementView = () =>{
    switch(checkRole(user)){
      case AMDINISTRATOR:{
        return  <div>
                  <div>AMDINISTRATOR : {user.displayName} - {user.email}</div>
                  <div>
                  <button onClick={()=>{
                    history.push("/me");
                  }}>Profile</button>
                    <button onClick={logout}>Logout</button>
                  </div>
                </div>
      }

      case AUTHENTICATED:{
        return  <div>
                  <div>AUTHENTICATED : {user.displayName} - {user.email}</div>
                  <div>
                  <button onClick={()=>{
                    history.push("/me");
                  }}>Profile</button>
                    <button onClick={logout}>Logout</button>
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
                  </div>
                 
                </div>
      }
    }
  }

  return (<div style={{flex:1}}>
            {managementView()}
            {
              _.map(suppliersValues.data.getSuppliers.data, (val, k)=>{
                return <div 
                        onClick={(evt)=>{
                          history.push({
                            pathname: "/detail",
                            // search: "?id=5",
                            // hash: "#react",
                            state: { id: val._id }
                          });
                        }} className="home-item">{val.title}</div>
              })
            }
          </div>);
}

const mapStateToProps = (state, ownProps) => {
  return { user:state.auth.user }
};

const mapDispatchToProps = { logout }
export default connect( mapStateToProps, mapDispatchToProps )(HomePage);