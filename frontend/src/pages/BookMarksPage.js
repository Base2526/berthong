import React, { useState } from "react";
import { useNavigate, useLocation, createSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import _ from "lodash"
// import { useQuery } from "@apollo/client";
import InfiniteScroll from "react-infinite-scroll-component";
import {
    Stack,
    LinearProgress,
    Avatar,
    Box,
    IconButton
} from '@mui/material';

import {
    MdOutlineBookmarkAdd as MdOutlineBookmarkAddIcon,
    MdOutlineBookmarkAdded as MdOutlineBookmarkAddedIcon
} from "react-icons/md"

// import { getHeaders } from "../util"
// import { queryBookmarks } from "../apollo/gqlQuery"

const initialValue = { slice: 20, hasMore: true}
const BookMarksPage = (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    let [input, setInput] = useState(initialValue)

    let { onMutationFollow, data, total } = props

    // const { loading: loadingBookmarks, 
    //         data: dataBookmarks, 
    //         error: errorBookmarks,
    //         fetchMore: fetchMoreBookmarks } = useQuery( queryBookmarks, { 
    //                                                     context: { headers: getHeaders(location) }, 
    //                                                     fetchPolicy: 'network-only', 
    //                                                     nextFetchPolicy: 'cache-first',
    //                                                     notifyOnNetworkStatusChange: true});

    // useEffect(() => {
    //     if (!loadingBookmarks) {
    //         if(dataBookmarks?.bookmarks){
    //             let { status, data, total } = dataBookmarks?.bookmarks
    //             if(status){
    //                 setInput({...input, data, total})
    //             }
    //         }
    //     }
    // }, [dataBookmarks, loadingBookmarks])
      
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
                                    _.map(data, (item, index) => {
                                        return  <div className="row p-2"><Stack direction="row" spacing={2}>
                                                    <Box className="pointer">
                                                        <Avatar
                                                            className={"image"}
                                                            sx={{ height: 40, width: 40 }}
                                                            variant="rounded"
                                                            overlap="circular"
                                                            alt="Example Alt"
                                                            onClick={()=>{
                                                                navigate({
                                                                pathname: "/d",
                                                                search: `?${createSearchParams({ id: item?._id})}`,
                                                                state: { id: item?._id }
                                                            })}}
                                                            src={ !_.isEmpty(item?.files) ? item?.files[0].url : "" }/>
                                                    </Box>
                                                    <Box className="pointer">
                                                        <div onClick={()=>{
                                                            navigate({
                                                            pathname: "/d",
                                                            search: `?${createSearchParams({ id: item?._id})}`,
                                                            state: { id: item?._id }
                                                        })}} key={index}>{item?.title}</div>
                                                    </Box>
                                                    <Box>
                                                        <IconButton 
                                                            onClick={(evt)=> onMutationFollow({ variables: { id: item?._id } }) }>
                                                            <MdOutlineBookmarkAddedIcon size={25} style={{ color: "blue" }} />
                                                        </IconButton>
                                                    </Box>
                                                </Stack>
                                            </div>
                                    }) 
                                }
                            </InfiniteScroll>
                    }
                </div>
            </div>
            </div>);
}

export default BookMarksPage