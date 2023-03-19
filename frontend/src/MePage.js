import { useQuery } from "@apollo/client";
import queryString from 'query-string';
import React from "react";
import { useTranslation } from "react-i18next";
import { connect } from "react-redux";
import { createSearchParams, useLocation, useNavigate } from "react-router-dom";

import { AMDINISTRATOR, AUTHENTICATED } from "./constants";
import { queryMe } from "./gqlQuery";
import { checkRole, getHeaders } from "./util";

import AutoGenerationContent from "./AutoGenerationContent";

const MePage = (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    let params = queryString.parse(location.search)
    
    let { user, updateProfile,  logout } = props

    console.log("params :", params)

    let meValues = useQuery(queryMe, {
        context: { headers: getHeaders(location) },
        notifyOnNetworkStatusChange: true,
    });

    console.log("meValues :", meValues)

    if(!meValues.loading){
        let { status, data } = meValues.data.me
        if(status){
            updateProfile(data)
        }
    }

    const managementView = () =>{
        switch(checkRole(user)){
            case AMDINISTRATOR:{
                return  <div>
                            <div className="div-management">
                                <div>Management</div>
                                <div>
                                    <button onClick={()=>{ 
                                        navigate("/withdraws");
                                    }}>รายการถอดเงิน รออนุมัติ</button>
                                </div>
                                <div>
                                    <button onClick={()=>{ 
                                        navigate("/deposits");
                                    }}>รายการฝากเงิน รออนุมัติ</button>
                                </div>
                                <div>
                                    <button onClick={()=>{ 
                                        navigate("/suppliers");
                                    }}>จัดการ Suppliers ทั้งหมด</button>
                                </div>

                                <div>
                                    <button onClick={()=>{ 
                                        navigate("/users");
                                    }}>จัดการ รายชือบุคคลทั้งหมด</button>
                                </div>
                                <div>
                                    <button onClick={()=>{ 
                                        navigate("/banks");
                                    }}>จัดการ รายชือธนาคารทั้งหมด</button>
                                </div>
                                <div>
                                    <button onClick={()=>{
                                        navigate("/date-lotterys");
                                    }}>จัดการ วันออกหวยทั้งหมด</button>
                                </div>

                                <div>
                                    <button onClick={()=>{ 
                                        navigate("/bank");
                                    }}>รายการ บัญชีธนาคาร ({user.banks.length})</button>
                                </div>
                            </div>
                            <AutoGenerationContent />
                        </div>
            }
            case AUTHENTICATED:{
                return  <div>
                            <div>
                                <button onClick={()=>{ 
                                    navigate("/book+buys");
                                }}>รายการ จอง-ซื้อ</button>
                            </div>
                            <div>
                                <button onClick={()=>{ 
                                    navigate("/deposit", {state: {from: "/", mode: "new"}} )
                                }}>รายการ แจ้งฝากเงิน</button>
                            </div>
                            <div>
                                <button onClick={()=>{ 
                                    navigate("/withdraw", {state: {from: "/", mode: "new"}} )
                                }}>รายการ แจ้งถอนเงิน</button>
                            </div>
                            <div>
                                <button onClick={()=>{ 
                                    navigate("/bank"); 
                                }}>รายการ บัญชีธนาคาร ({user.banks.length})</button>
                            </div>
                            <div>
                                <button onClick={()=>{
                                    navigate("/suppliers"); 
                                }}>Supplier list</button>
                            </div>

                            <div>
                                <button onClick={()=>{
                                    navigate("/history-transitions"); 
                                }}>History-Transitions</button>
                            </div>
                        </div>
            }
        }
    }

    return (  <div style={{flex:1}}>
                    <div> Profile Page {user.displayName} - {user.email} </div>
                    <button onClick={()=>{
                        // history.push({ pathname: "/user",  search: `?u=${user._id}`, state: {from: "/", mode: "edit", id: user._id } });
                        navigate("/user",  {
                                                search: `?${createSearchParams({ u: user._id})}`,
                                                state: {from: "/", mode: "edit", id: user._id }
                                            })
                    }}>แก้ไขข้อมูล</button>
                    <div> Balance : { user?.balance }[-{ user?.balanceBook }]</div>
                    {managementView()}
                    <button onClick={()=>{
                        logout()
                        // history.push("/");
                        navigate("/")
                    }}>Logout</button>
                </div>);
}

const mapStateToProps = (state, ownProps) => {
    return { }
};

const mapDispatchToProps = {}

export default connect( mapStateToProps, mapDispatchToProps )(MePage);