import React, { useState,  useEffect } from "react";
import { useNavigate, useLocation, createSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import _ from "lodash"
import { useQuery } from "@apollo/client";
import InfiniteScroll from "react-infinite-scroll-component";
import {
    Stack,
    LinearProgress,
    Box,
    Avatar,
    Button
} from '@mui/material';

import { getHeaders } from "../util"
import { querySubscribes } from "../apollo/gqlQuery"

const initialValue = {slice: 20, hasMore: true}

const SubscribesPage = (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    let [input, setInput] = useState(initialValue)

    let { user, onMutationSubscribe, data, total } = props

    // const { loading: loadingSubscribes, 
    //         data: dataSubscribes, 
    //         error: errorSubscribes,
    //         fetchMore: fetchMoreSubscribes } = useQuery( querySubscribes, { 
    //                                                     context: { headers: getHeaders(location) }, 
    //                                                     fetchPolicy: 'cache-first',  
    //                                                     nextFetchPolicy: 'network-only', 
    //                                                     notifyOnNetworkStatusChange: true});

    // useEffect(() => {
    //     if (!loadingSubscribes) {
    //         if(dataSubscribes?.subscribes){
    //             let { status, data, total } = dataSubscribes?.subscribes
    //             if(status){
    //                 setInput({...input, data, total})
    //             }
    //         }
    //     }
    // }, [dataSubscribes, loadingSubscribes])
      
    const fetchMoreData = async() =>{

        // let mores =  await fetchMoreNotifications({ variables: { input: {...search, OFF_SET:search.OFF_SET + 1} } })
        // let {status, data} =  mores.data.suppliers
        // console.log("status, data :", status, data)
       
        if(_.isEqual( input.slice, total )){
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
                    data.length == 0 
                    ?   <div>Empty data</div>
                    :   <InfiniteScroll
                            dataLength={input.slice}
                            next={fetchMoreData}
                            hasMore={input.hasMore}
                            loader={<h4>Loading...</h4>}>
                            { 
                                _.map( data, (item, index) => {                                
                                    return  <div className="row p-2">
                                            <Stack direction="row" spacing={2}>
                                                <Box className="pointer">
                                                    <Avatar
                                                        className={"user-profile"}
                                                        sx={{ height: 40, width: 40 }}
                                                        variant="rounded"
                                                        overlap="circular"
                                                        alt="Example Alt"
                                                        onClick={()=>{
                                                            navigate({ pathname: `/p`, search: `?${createSearchParams({ id: item?._id})}` })  
                                                        }} 
                                                        src={_.isEmpty(item?.avatar) ? "" : item?.avatar?.url }/>
                                                </Box>
                                                <Box className="pointer">
                                                    <div 
                                                        onClick={()=>{
                                                            navigate({ pathname: `/p`, search: `?${createSearchParams({ id: item?._id})}` })  
                                                        }} 
                                                        key={index}>
                                                        {item?.displayName}
                                                    </div>
                                                </Box>
                                                <Box>
                                                    <Button 
                                                        variant="outlined"
                                                        size="small"
                                                        onClick={(evt)=>onMutationSubscribe({ variables: { id: item?._id } })}>
                                                        { _.find( item?.subscriber, (i)=> _.isEqual( i?.userId,  user?._id) ) ? "Unsubscribe" : "Subscribe" }
                                                    </Button>
                                                </Box>
                                            </Stack>
                                            </div>
                                }) 
                            }
                        </InfiniteScroll>
                }
            </div></div></div>);
}

export default SubscribesPage