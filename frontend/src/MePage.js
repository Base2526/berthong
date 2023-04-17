import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import queryString from 'query-string';
import { useTranslation } from "react-i18next";
import { createSearchParams, useLocation, useNavigate } from "react-router-dom";
import {
    Avatar
} from '@mui/material';
import {
    AiFillCamera as CameraIcon,
    AiOutlineZoomIn as ZoomInIcon
} from "react-icons/ai" 
import { IconButton, LinearProgress } from "@material-ui/core";
import _ from "lodash"
import { styled } from "@mui/material/styles";

import { AMDINISTRATOR, AUTHENTICATED } from "./constants";
import { queryMe } from "./gqlQuery";
import { checkRole, getHeaders } from "./util";
import AutoGenerationContent from "./AutoGenerationContent";
const Input = styled("input")({ display: "none" });

const MePage = (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    let params = queryString.parse(location.search)
    
    let { user, updateProfile, logout, onLightbox } = props

    const [data, setData] = useState()

    const { loading: loadingMe, 
            data: dataMe, 
            error: errorMe, 
            refetch: refetchMe,
            networkStatus } = useQuery(queryMe, 
                                        { 
                                            context: { headers: getHeaders(location) }, 
                                            fetchPolicy: 'cache-first',
                                            nextFetchPolicy: 'network-only',
                                            notifyOnNetworkStatusChange: true
                                        }
                                    );

    useEffect(()=>{
        if(!loadingMe){
            if(!_.isEmpty(dataMe?.me)){
                let { status, data } = dataMe?.me

                console.log("data : ", data)
                if(status){
                    updateProfile(data)

                    setData(data)
                }
            }
        }
    }, [dataMe, loadingMe])

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

    return (<div style={{flex:1}}>
                {
                    loadingMe || _.isEmpty(data)
                    ?  <LinearProgress />
                    :  <>
                            <div>
                                <Avatar 
                                    sx={{ width: 80, height: 80 }} 
                                    src= { _.isEmpty(data?.avatar) ? "" :  data?.avatar?.url ? data?.avatar?.url : URL.createObjectURL(data?.avatar) }
                                    variant="rounded" />
                                <>
                                    <label htmlFor="contained-button-file">
                                        <Input
                                            accept="image/*"
                                            id="contained-button-file"
                                            name="file"
                                            multiple={ false }
                                            type="file"
                                            onChange={(e) => setData({...data, avatar: e.target.files[0]}) } />
                                        <IconButton
                                            color="primary"
                                            aria-label="upload picture"
                                            component="span">
                                            <CameraIcon size="0.8em"/>
                                        </IconButton>
                                    </label>
                                    { data?.avatar?.url &&  <IconButton onClick={(evt)=> onLightbox({ isOpen: true, photoIndex: 0, images:[data?.avatar] }) }><ZoomInIcon size="0.8em" /></IconButton> }
                                </>
                            </div>
                            <div> Display name : {data.displayName} </div>
                            <div> Email : {data.email} </div>
                            <button onClick={()=>{
                                navigate("/user",  {
                                                        search: `?${createSearchParams({ u: data._id})}`,
                                                        state: {from: "/", mode: "edit", id: data._id }
                                                    })
                            }}>แก้ไขข้อมูล</button>
                            <div> Balance : { data?.balance }[-{ data?.balanceBook }]</div>
                            {managementView()}
                            {/* <button onClick={()=>{
                                logout()
                                // history.push("/");
                                navigate("/")
                            }}>Logout</button> */}
                        </>
                }
            </div>);
}

export default MePage