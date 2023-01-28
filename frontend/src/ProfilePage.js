import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import { ToastContainer, toast } from 'react-toastify';
import CircularProgress from '@mui/material/CircularProgress';
import 'react-toastify/dist/ReactToastify.css';
import _ from "lodash"
import { useQuery, useMutation, useSubscription } from "@apollo/client";
import LinearProgress from '@mui/material/LinearProgress';

import { getHeaders, checkRole } from "./util"
import { queryMe, queryBalanceById } from "./gqlQuery"
import { login, logout } from "./redux/actions/auth"
import { AMDINISTRATOR, AUTHENTICATED } from "./constants"

const ProfilePage = (props) => {
    let history = useHistory();
    let location = useLocation();
    let { t } = useTranslation();

    let { user, login,  logout } = props

    // console.log("user :", user)

    let meValues = useQuery(queryMe, {
        context: { headers: getHeaders() },
        notifyOnNetworkStatusChange: true,
    });

    console.log("meValues :", meValues)

    if(!meValues.loading){
        let { status, data } = meValues.data.me
        if(status){
            login(data)
        }
    }

    const balanceView = () =>{
        const balanceByIdValue = useQuery(queryBalanceById, 
            { 
            context: { headers: getHeaders() },
            variables: {id: user._id},
            notifyOnNetworkStatusChange: true 
            });

        console.log("balanceByIdValue :", balanceByIdValue)

        if(balanceByIdValue.loading){
            return <div> Balance : <LinearProgress sx={{width:"100px"}} /> </div>
        }

        return <div> Balance : {balanceByIdValue.data.balanceById.data}</div>
    }

    const managementView = () =>{
        switch(checkRole(user)){
            case AMDINISTRATOR:{
                return  <div>
                            <div className="div-management">
                                <div>Management</div>
                                <div>
                                    <button onClick={()=>{ history.push("/withdraws"); }}>รายการถอดเงิน รออนุมัติ</button>
                                </div>
                                <div>
                                    <button onClick={()=>{ history.push("/deposits"); }}>รายการฝากเงิน รออนุมัติ</button>
                                </div>
                                <div>
                                    <button onClick={()=>{ history.push("/suppliers"); }}>จัดการ Suppliers ทั้งหมด</button>
                                </div>

                                <div>
                                    <button onClick={()=>{ history.push("/users"); }}>จัดการ รายชือบุคคลทั้งหมด</button>
                                </div>
                                <div>
                                    <button onClick={()=>{ history.push("/banks"); }}>จัดการ รายชือธนาคารทั้งหมด</button>
                                </div>
                            </div>
                            <div>
                                <button onClick={()=>{ history.push("/me+bank"); }}>รายการ บัญชีธนาคาร ({user.banks.length})</button>
                            </div>
                        </div>
            }
            case AUTHENTICATED:{
                return  <div>
                            <div>
                                <button onClick={()=>{ history.push("/deposits"); }}>รายการ แจ้งฝากเงิน</button>
                            </div>
                            <div>
                                <button onClick={()=>{ history.push("/withdraws"); }}>รายการ แจ้งถอนเงิน</button>
                            </div>
                            <div>
                                <button onClick={()=>{ history.push("/me+bank"); }}>รายการ บัญชีธนาคาร ({user.banks.length})</button>
                            </div>
                            <div>
                                <button onClick={()=>{history.push("/suppliers"); }}>Supplier list</button>
                            </div>
                        </div>
            }
        }
    }

    return (  <div style={{flex:1}}>
                    <div> Profile Page {user.displayName} - {user.email} </div>
                    
                    {balanceView()}
                    {managementView()}
                    <button onClick={()=>{
                        logout()
                        history.push("/");
                    }}>Logout</button>
                </div>);
}

const mapStateToProps = (state, ownProps) => {
    return { user:state.auth.user }
};

const mapDispatchToProps = { login, logout }

export default connect( mapStateToProps, mapDispatchToProps )(ProfilePage);