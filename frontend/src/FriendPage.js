import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, createSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import _ from "lodash"
import { useQuery } from "@apollo/client";
import queryString from 'query-string';
import {
    Box,
    Stack,
    Avatar,
    CircularProgress,
    IconButton
} from '@mui/material';

import {
    SlUserFollow,
    SlUserFollowing
} from "react-icons/sl"
import InfiniteScroll from "react-infinite-scroll-component";
import moment from "moment";

import { getHeaders } from "./util"
import { queryFriendProfile } from "./gqlQuery"

const FriendPage = (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    const { user, onLogin, onLightbox, onMutationSubscribe } = props

    let [data, setData] = useState([]);
    let [total, setTotal] = useState(0)
    let [slice, setSlice] = useState(20);
    let [hasMore, setHasMore] = useState(true)
      
    let params = queryString.parse(location.search)
    if(_.isEmpty(params?.id)){
        navigate(-1)
        return;
    }

    const { loading: loadingProfile, 
            data: dataProfile, 
            error: errorProfile, 
            networkStatus } = useQuery( queryFriendProfile, { 
                                        context: { headers: getHeaders(location) }, 
                                        variables: {id: params.id},
                                        fetchPolicy: 'cache-first', 
                                        nextFetchPolicy: 'network-only', 
                                        notifyOnNetworkStatusChange: true});

    useEffect(() => {
        if(!loadingProfile){
            if (dataProfile?.friendProfile) {
                let { status, data } = dataProfile?.friendProfile
                if(status){
                  setData(data)
                }
            }
        }
    }, [dataProfile, loadingProfile])

    ///////////////////////
  

    // // We need to keep the table from resetting the pageIndex when we
    // // Update data. So we can keep track of that flag with a ref.
    // const skipResetRef = useRef(false)

    // // When our cell renderer calls updateMyData, we'll use
    // // the rowIndex, columnId and new value to update the
    // // original data
    // const updateMyData = (rowIndex, columnId, value) => {
    //     skipResetRef.current = true
    // }
    
    if( loadingProfile ){
        return <CircularProgress />
    }

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
                <Stack 
                    direction="row" 
                    spacing={2}>
                    <>
                        <Avatar
                            className={"user-profile"}
                            sx={{ height: 80, width: 80 }}
                            variant="rounded"
                            alt="Example Alt"
                            src={_.isEmpty(data?.avatar) ? "" : data?.avatar?.url }/>
                        <div> Name : {data?.displayName}</div>   
                    </>
                    <Box>
                        <IconButton onClick={(evt)=> _.isEmpty(user) ? onLogin(true) : onMutationSubscribe({ variables: { id: params.id } }) }>
                            {   
                                _.find( data?.subscriber, (i)=> _.isEqual( i?.userId,  user?._id) ) 
                                ? <SlUserFollowing size={"20px"} color="blue" />  
                                : <SlUserFollow size={"20px"} /> 
                            } 
                        </IconButton> 
                    </Box>
                </Stack>
                {/* <TableComp
                    columns={columns}
                    data={_.isEmpty( data?.suppliers ) ? [] :  data?.suppliers }
                    fetchData={fetchData}
                    rowsPerPage={pageOptions}
                    updateMyData={updateMyData}
                    skipReset={skipResetRef.current}
                    isDebug={false}/> */}

                {
                    data?.suppliers?.length == 0 
                    ?   <label>Empty data</label>
                    :   <div>
                            <div>สินค้าทั้งหมด</div>
                            <InfiniteScroll
                                dataLength={slice}
                                next={fetchMoreData}
                                hasMore={false}
                                loader={<h4>Loading...</h4>}>
                                { 
                                _.map(data?.suppliers, (item, index) => {
                                    // console.log("suppliers :", item)

                                    let title         = item?.title;
                                    let description   = item?.description;
                                    let files         = item?.files;
                                    let price         = item.price;
                                    let priceUnit     = item.priceUnit;
                                    let buys          = item.buys;
                                    //   let follows = item.follows;
                                    //   let files   = item?.files
                                    
                                    let updatedAt = new Date(item.updatedAt).toLocaleString('en-US', { timeZone: 'asia/bangkok' });
                            
                                    return <Stack direction="row" spacing={2} >
                                            <Box sx={{ width: '10%' }}>
                                                <Avatar
                                                    alt=""
                                                    variant="rounded"
                                                    src={files[0]?.url}
                                                    onClick={(e) => {
                                                        onLightbox({ isOpen: true, photoIndex: 0, images:files })
                                                    }}
                                                    sx={{ width: 56, height: 56 }} />
                                            </Box>
                                            <Box 
                                                sx={{ width: '10%' }}
                                                onClick={()=>{
                                                    navigate({
                                                        pathname: "/d",
                                                        search: `?${createSearchParams({ id: item._id})}`,
                                                        state: { id: item._id }
                                                    })
                                                }}
                                            >{title}</Box>
                                            <Box sx={{ width: '20%' }}>{description}</Box>
                                            <Box sx={{ width: '5%' }}>{priceUnit}/{price}</Box>
                                            <Box sx={{ width: '15%' }}>ยอดจอง { _.filter(buys, (buy)=> buy.selected == 0 )?.length }, ขายไปแล้ว { _.filter(buys, (buy)=> buy.selected == 1 )?.length }</Box>
                                            <Box sx={{ width: '10%' }}>{(moment(updatedAt, 'MM/DD/YYYY HH:mm')).format('DD MMM, YYYY HH:mm A')}</Box>
                                            {/*
                                            <Box sx={{ width: '5%' }}>{condition}</Box>
                                            <Box sx={{ width: '5%' }}>{buys.length}</Box>
                                            <Box sx={{ width: '5%' }}>{follows.length}</Box>
                                            <Box sx={{ width: '20%' }}>
                                                <button onClick={(evt)=>{
                                                navigate("/supplier", {state: {from: "/", mode: "edit", id: item?._id} })
                                                }}><EditIcon/>{t("edit")}
                                                </button>
                                                <button onClick={(e)=>{
                                                setOpenDialogDelete({ isOpen: true, id: item?._id, description: item?.description });
                                                }}><DeleteForeverIcon/>{t("delete")}</button>
                                            </Box> 
                                            */}
                                            </Stack>

                                })
                            }
                            </InfiniteScroll>
                        </div>
                }
            </div>);
}

export default FriendPage