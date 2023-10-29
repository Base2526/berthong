import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import _ from "lodash"
import { useQuery } from "@apollo/client";
import InfiniteScroll from "react-infinite-scroll-component";
import {Stack, LinearProgress } from '@mui/material';
import {
    MdSystemSecurityUpdateWarning as SystemIcon,
    MdOutlineAttachMoney as DepositIcon,
    MdOutlineMoneyOffCsred as WithdrawIcon
} from "react-icons/md"
import {
    AiOutlineInfoCircle as InfoIcon
} from "react-icons/ai"
import moment from "moment";

import { getHeaders, numberCurrency } from "../util"
import { queryNotifications } from "../apollo/gqlQuery"
import * as Constants from "../constants"

let initialValue = { data: [] , total : 0, slice: 20, hasMore: true}

const NotificationsPage = (props) => {
    let navigate = useNavigate();
    let location = useLocation();
    let { t } = useTranslation();
    
    let [input, setInput] = useState(initialValue)

    let { onMutationNotification } = props

    const { loading: loadingNotifications, 
            data: dataNotifications, 
            error: errorNotifications,
            fetchMore: fetchMoreNotifications } = useQuery( queryNotifications, { 
                                                            context: { headers: getHeaders(location) }, 
                                                            fetchPolicy: 'cache-first', 
                                                            nextFetchPolicy: 'network-only', 
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
                    loadingNotifications
                    ?   <LinearProgress />
                    :   input?.data?.length == 0
                        ? <div>Empty data</div>
                        : <InfiniteScroll
                            dataLength={input.slice}
                            next={fetchMoreData}
                            hasMore={input.hasMore}
                            loader={<h4>Loading...</h4>}>
                            { 
                                //  0: 'withdraw', 1: 'deposit', 2: 'system', 3: 'info'
                                _.map(input.data, (i, index) => {
                                    switch(i?.type){
                                        case 3:{
                                            return  <div class="alert alert-warning p-1 m-1" role="alert">
                                                        <Stack direction="row" spacing={2}>
                                                            <InfoIcon />
                                                            <div 
                                                                onClick={(evt)=>{
                                                                    console.log("info")
                                                                }
                                                            } key={index}>{(moment(new Date(i?.createdAt) , 'YYYY-MM-DD HH:mm')).format('MMMM Do YYYY, h:mm:ss a')}  </div>
                                                        </Stack>
                                                    </div>
                                        }
                                        case 2:{
                                            return  <div class="alert alert-secondary p-1 m-1" role="alert"><Stack direction="row" spacing={2}>
                                                        <SystemIcon />
                                                        <div 
                                                            onClick={(evt)=>{
                                                                console.log("system")

                                                                // onMutationNotification({ variables: { id:"63ff3c0c6637e303283bc40f" } })
                                                            }
                                                        } key={index}>{(moment(new Date(i?.createdAt), 'YYYY-MM-DD HH:mm')).format('MMMM Do YYYY, h:mm:ss a')}  </div>
                                                    </Stack>
                                                    </div>
                                        }
                                        case 1:{
                                            // status >>  Constants.REJECT, Constants.APPROVED
                                            // flag   >>  0: 'unread', 1: 'read'
                                            return  <div class="alert alert-warning p-1 m-1" role="alert">
                                                        <Stack direction="row" spacing={2}>
                                                            <DepositIcon />
                                                            <div>ยอดฝากเงิน : {numberCurrency(i?.data?.deposit?.balance)} </div>
                                                            <div>{i?.status === Constants.APPROVED ? "APPROVED" : "REJECT"}</div>
                                                            {/* <div>{i?.flag === 0 ? "UNREAD" : "READ"}</div> */}
                                                            <div key={index}>{(moment(new Date(i?.createdAt), 'YYYY-MM-DD HH:mm')).format('MMMM Do YYYY, h:mm:ss a')}  </div>
                                                        </Stack>
                                                    </div>
                                        }
                                        case 0:{
                                            return  <div class="alert alert-success p-1 m-1" role="alert">
                                                        <Stack direction="row" spacing={2}>
                                                            <WithdrawIcon />
                                                            <div key={index}>{(moment(new Date(i?.createdAt) , 'YYYY-MM-DD HH:mm')).format('MMMM Do YYYY, h:mm:ss a')} </div>
                                                        </Stack>
                                                    </div>
                                        }
                                    }
                                }) 
                            }
                        </InfiniteScroll>
                    }
                        
                </div>
                </div>
            </div>);
}
export default NotificationsPage