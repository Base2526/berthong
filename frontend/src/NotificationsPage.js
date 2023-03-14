import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useNavigate, useLocation, createSearchParams } from "react-router-dom";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import _ from "lodash"
import { useQuery, useMutation } from "@apollo/client";
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
import { queryNotifications, mutationNotification } from "./gqlQuery"

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

    const [onMutationNotification, resultNotification] = useMutation(mutationNotification, {
        context: { headers: getHeaders(location) },
        update: (cache, {data: {notification}}) => {
            let { data, status } = notification
            console.log("update")

        //   if(status){
        //     switch(mode){
        //       case "new":{
        //         const querySuppliersValue = cache.readQuery({ query: querySuppliers });

        //         if(!_.isNull(querySuppliersValue)){
        //           let newData = [...querySuppliersValue.suppliers.data, data];

        //           cache.writeQuery({
        //             query: querySuppliers,
        //             data: { suppliers: {...querySuppliersValue.suppliers, data: newData} }
        //           });
        //         }
        //         break;
        //       }
        //       case "edit":{
        //         const querySuppliersValue = cache.readQuery({ query: querySuppliers });
        //         if(!_.isNull(querySuppliersValue)){
        //           let newData = _.map(querySuppliersValue.suppliers.data, (item)=> item._id == data._id ? data : item ) 

        //           cache.writeQuery({
        //             query: querySuppliers,
        //             data: { suppliers: {...querySuppliersValue.suppliers, data: newData} }
        //           });
        //         }
        //         break;
        //       }
        //     }
        //   }
        },
        onCompleted(data) {
            // navigate(-1)
            console.log("onCompleted")
        },
        onError(error){
            console.log(error)
        //   _.map(error?.graphQLErrors, (e)=>{
        //     switch(e?.extensions?.code){
        //       case FORCE_LOGOUT:{
        //         logout()
        //         break;
        //       } 
        //       case DATA_NOT_FOUND:
        //       case UNAUTHENTICATED:
        //       case ERROR:{
        //         showToast("error", e?.message)
        //         break;
        //       }
        //     }
        //   })
        }
    });

    useEffect(() => {
        if (!loadingNotifications) {
            if(dataNotifications?.notifications){
                let { status, data, total} = dataNotifications?.notifications
                if(status){
                    setTotal(total)
                    setDatas(data)
                    
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

    return (<div>
                {
                loadingNotifications
                ?  <CircularProgress />
                :  datas.length == 0 
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
                                                        <div 
                                                            onClick={(evt)=>{
                                                                console.log("system")

                                                                onMutationNotification({ variables: { id:"63ff3c0c6637e303283bc40f" } })
                                                            }
                                                        } key={index}>{i?.data} {i?.status} </div>
                                                    </Stack>
                                        }
                                        case "withdraw":{
                                            return  <Stack direction="row" spacing={2}>
                                                        <WithdrawIcon />
                                                        <div 
                                                            onClick={(evt)=>{
                                                                console.log("withdraw")

                                                                onMutationNotification({ variables: { id:"63ff3c0c6637e303283bc40f" } })
                                                            }
                                                        } key={index}>{i?.data} {i?.status} </div>
                                                    </Stack>
                                        }
                                        case "deposit":{
                                            return  <Stack direction="row" spacing={2}>
                                                        <DepositIcon />
                                                        <div 
                                                            onClick={(evt)=>{
                                                                console.log("deposit")

                                                                onMutationNotification({ variables: { id:"63ff3c0c6637e303283bc40f" } })
                                                            }
                                                        } key={index}>{i?.data} {i?.status} </div>
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
    return { }
}
const mapDispatchToProps = { }
export default connect( mapStateToProps, mapDispatchToProps )(NotificationsPage);