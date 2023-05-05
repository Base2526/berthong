import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useNavigate, useLocation, createSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import _ from "lodash"
import { useQuery } from "@apollo/client";
import InfiniteScroll from "react-infinite-scroll-component";

import {
    Box,
    Stack,
    Avatar,
    CircularProgress,
    IconButton,
    LinearProgress
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

const initialValue = { data: [] , total : 0, slice: 20, hasMore: true}

const NotificationsPage = (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    
    let [input, setInput] = useState(initialValue)

    let { onMutationNotification } = props

    const { loading: loadingNotifications, 
            data: dataNotifications, 
            error: errorNotifications,
            fetchMore: fetchMoreNotifications } = useQuery( queryNotifications, { 
                                                    context: { headers: getHeaders(location) }, 
                                                    fetchPolicy: 'cache-first', // Used for first execution
                                                    nextFetchPolicy: 'network-only', // Used for subsequent executions
                                                    notifyOnNetworkStatusChange: true});

    useEffect(() => {
        if (!loadingNotifications) {
            if(dataNotifications?.notifications){
                let { status, data, total} = dataNotifications?.notifications
                if(status){
                    setInput({...input, data, total})
                }
            }
        }
    }, [dataNotifications, loadingNotifications])
      
    const fetchMoreData = async() =>{

        // let mores =  await fetchMoreNotifications({ variables: { input: {...search, OFF_SET:search.OFF_SET + 1} } })
        // let {status, data} =  mores.data.suppliers
        // console.log("status, data :", status, data)
       
        if(_.isEqual( input.slice, input.total )){
            // setHasMore(false);
            setInput({...input, hasMore: false})
        }else{
            setTimeout(() => {
                // let newDatas = [...datas, ...data]
                // setDatas(newDatas)
                // setSlice(newDatas.length);
            }, 1000); 
        }
    }

    return (<div className="content-bottom">
    <div className="content-page border">   
    <div className="row">
                {
                loadingNotifications || input.data.length == 0 
                ?   <LinearProgress />
                :   <InfiniteScroll
                        dataLength={input.slice}
                        next={fetchMoreData}
                        hasMore={input.hasMore}
                        loader={<h4>Loading...</h4>}>
                        { 
                            _.map(input.data, (i, index) => {
                                switch(i?.type){
                                    case "system":{
                                        return  <div class="alert alert-secondary p-1 m-1" role="alert"><Stack direction="row" spacing={2}>
                                                    <SystemIcon />
                                                    <div 
                                                        onClick={(evt)=>{
                                                            console.log("system")

                                                            onMutationNotification({ variables: { id:"63ff3c0c6637e303283bc40f" } })
                                                        }
                                                    } key={index}>05-APR-2023 00:00:01 {i?.data} {i?.status} </div>
                                                </Stack>
                                                </div>
                                    }
                                    case "withdraw":{
                                        return  <div class="alert alert-success p-1 m-1" role="alert"><Stack direction="row" spacing={2}>
                                                    <WithdrawIcon />
                                                    <div 
                                                        onClick={(evt)=>{
                                                            console.log("withdraw")

                                                            onMutationNotification({ variables: { id:"63ff3c0c6637e303283bc40f" } })
                                                        }
                                                    } key={index}>05-APR-2023 00:00:01 {i?.data} {i?.status} </div>
                                                </Stack>
                                                </div>
                                    }
                                    case "deposit":{
                                        return  <div class="alert alert-warning p-1 m-1" role="alert"><Stack direction="row" spacing={2}>
                                                    <DepositIcon />
                                                    <div 
                                                        onClick={(evt)=>{
                                                            console.log("deposit")

                                                            onMutationNotification({ variables: { id:"63ff3c0c6637e303283bc40f" } })
                                                        }
                                                    } key={index}>05-APR-2023 00:00:01 {i?.data} {i?.status} </div>
                                                </Stack>
                                                </div>
                                    }
                                }
                            }) 
                        }
                    </InfiniteScroll>
                }
            </div></div></div>);
}

export default NotificationsPage