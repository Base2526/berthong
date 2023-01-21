import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import { ToastContainer, toast } from 'react-toastify';
import CircularProgress from '@mui/material/CircularProgress';
import 'react-toastify/dist/ReactToastify.css';
import _ from "lodash"
import { useQuery, useMutation, useApolloClient } from "@apollo/client";

import { getHeaders } from "./util"
import { gqlSupplierById, gqlBook, gqlBuys } from "./gqlQuery"

const ProfilePage = (props) => {
  let history = useHistory();
  let location = useLocation();
  let { t } = useTranslation();

  let { user } = props

  return (  <div style={{flex:1}}>
                <div> Profile Page {user.displayName} - {user.email} </div>
                <div>
                    <button onClick={()=>{
                         history.push("/suppliers");
                    }}>Supplier list</button>
                </div>
            </div>);
}

const mapStateToProps = (state, ownProps) => {
    return { user:state.auth.user }
};

const mapDispatchToProps = {}

export default connect( mapStateToProps, mapDispatchToProps )(ProfilePage);