import React, { useState,  useEffect } from "react";
import { useNavigate, useLocation, createSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import _ from "lodash"
import { useQuery } from "@apollo/client";
import InfiniteScroll from "react-infinite-scroll-component";
import {
    Stack,
    LinearProgress
} from '@mui/material';

import { getHeaders } from "./util"
import { queryBookmarks, mutationNotification } from "./gqlQuery"

const initialValue = { data: [], slice: 20, total: 0, hasMore: true}

const BookMarksPage = (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    
    let [input, setInput] = useState(initialValue)

    const { loading: loadingBookmarks, 
            data: dataBookmarks, 
            error: errorBookmarks,
            fetchMore: fetchMoreBookmarks } = useQuery( queryBookmarks, { 
                                                        context: { headers: getHeaders(location) }, 
                                                        fetchPolicy: 'cache-first', // Used for first execution
                                                        nextFetchPolicy: 'network-only', // Used for subsequent executions
                                                        notifyOnNetworkStatusChange: true});

    // const [onMutationNotification, resultNotification] = useMutation(mutationNotification, {
    //     context: { headers: getHeaders(location) },
    //     update: (cache, {data: {notification}}) => {
    //         let { data, status } = notification
    //         console.log("update")
    //     },
    //     onCompleted(data) {
    //         console.log("onCompleted")
    //     },
    //     onError(error){
    //         console.log(error)
    //     }
    // });

    useEffect(() => {
        if (!loadingBookmarks) {
            if(dataBookmarks?.bookmarks){
                let { status, data, total } = dataBookmarks?.bookmarks
                if(status){
                    setInput({...input, data, total})
                }
            }
        }
    }, [dataBookmarks, loadingBookmarks])
      
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

    return (<div>
                {
                loadingBookmarks || input.data.length == 0 
                ?   <LinearProgress />
                :   <InfiniteScroll
                        dataLength={input.slice}
                        next={fetchMoreData}
                        hasMore={input.hasMore}
                        loader={<h4>Loading...</h4>}>
                        { 
                            _.map(input.data, (item, index) => {
                                return  <Stack direction="row" spacing={2}>
                                            <div onClick={()=>{
                                                navigate({
                                                pathname: "/d",
                                                search: `?${createSearchParams({ id: item?._id})}`,
                                                state: { id: item?._id }
                                            })}} key={index}>{item?.title}</div>
                                        </Stack>
                            }) 
                        }
                    </InfiniteScroll>
                }
            </div>);
}

export default BookMarksPage