import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useNavigate, useLocation, createSearchParams } from "react-router-dom";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import _ from "lodash"
import { useQuery } from "@apollo/client";
import queryString from 'query-string';
import InfiniteScroll from "react-infinite-scroll-component";

import {
    Box,
    Stack,
    Avatar,
    CircularProgress,
    IconButton
} from '@mui/material';

import {
    SlUserFollow
} from "react-icons/sl"

import {
    MdSystemSecurityUpdateWarning as SystemIcon,
    MdOutlineAttachMoney as DepositIcon,
    MdOutlineMoneyOffCsred as WithdrawIcon
} from "react-icons/md"

import { getHeaders } from "./util"
import { queryNotifications } from "./gqlQuery"
// import { login, logout } from "./redux/actions/auth"
// import TableComp from "./components/TableComp"
// import ReadMoreMaster from "./ReadMoreMaster"

const style = {
    height: 30,
    border: "1px solid green",
    margin: 6,
    padding: 8
};

const NotificationsPage = (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    
    let [datas, setDatas] = useState([]);
    let [total, setTotal] = useState(0)
    let [slice, setSlice] = useState(20);
    let [hasMore, setHasMore] = useState(true)

    const { loading: loadingNotifications, 
            data: dataNotifications, 
            error: errorNotifications,
            fetchMore: fetchMoreNotifications, } = useQuery( queryNotifications, { 
                                                    context: { headers: getHeaders(location) }, 
                                                    fetchPolicy: 'network-only', // Used for first execution
                                                    nextFetchPolicy: 'cache-first', // Used for subsequent executions
                                                    notifyOnNetworkStatusChange: true});

    useEffect(() => {
        if (!loadingNotifications) {
            if(dataNotifications?.notifications){
                let { status, data, total} = dataNotifications?.notifications
                if(status){
                    setDatas(data)
                    setTotal(total)

                    console.log("data: ", data)
                }
            }
        }
    }, [dataNotifications, loadingNotifications])
      
    const fetchMoreData = async() =>{

        // let mores =  await fetchMoreNotifications({ variables: { input: {...search, OFF_SET:search.OFF_SET + 1} } })
        // let {status, data} =  mores.data.suppliers
        // console.log("status, data :", status, data)
       
        if(slice === total){
            setHasMore(false);
        }else{
            setTimeout(() => {
                // let newDatas = [...datas, ...data]
                // setDatas(newDatas)
                // setSlice(newDatas.length);
            }, 1000); 
        }
    }

    return (<div style={{flex:1}}>
                {
                total == 0 
                ?   <label>Empty notifications</label>
                :   <InfiniteScroll
                        dataLength={slice}
                        next={fetchMoreData}
                        hasMore={hasMore}
                        loader={<h4>Loading...</h4>}>
                        { 
                            _.map(datas, (i, index) => {
                                switch(i?.type){
                                    case "system":{
                                        return  <Stack direction="row" spacing={2}>
                                                    <SystemIcon />
                                                    <div key={index}>{i?.data} {i?.status} </div>
                                                </Stack>
                                    }
                                    case "withdraw":{
                                        return  <Stack direction="row" spacing={2}>
                                                    <WithdrawIcon />
                                                    <div key={index}>{i?.data} {i?.status} </div>
                                                </Stack>
                                    }
                                    case "deposit":{
                                        return  <Stack direction="row" spacing={2}>
                                                    <DepositIcon />
                                                    <div key={index}>{i?.data} {i?.status} </div>
                                                </Stack>
                                    }
                                }
                            }) 
                        }
                    </InfiniteScroll>
                }
                
            </div>);
}

const mapStateToProps = (state, ownProps) => {
    return { user:state.auth.user }
}
const mapDispatchToProps = { }
export default connect( mapStateToProps, mapDispatchToProps )(NotificationsPage);