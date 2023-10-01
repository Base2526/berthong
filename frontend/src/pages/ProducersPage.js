import React, { useState,  useEffect, useRef, useMemo, useCallback } from "react";
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
import moment from "moment";
import {Edit as EditIcon,  DeleteForever as DeleteForeverIcon} from '@mui/icons-material';

import { getHeaders } from "../util"
import { queryProducers } from "../apollo/gqlQuery"

import TableComp from "../components/TableComp"

const initialValue = { data: [], slice: 20, total: 0, hasMore: true}

const ProducersPage = (props) => {
    let navigate = useNavigate();
    let location = useLocation();
    let { t } = useTranslation();
    let [input, setInput] = useState(initialValue)

    let [datas, setDatas] = useState([]);
    let [pageOptions, setPageOptions] = useState([30, 50, 100]);
    let [pageIndex, setPageIndex] = useState(0);  
    let [pageSize, setPageSize] = useState(pageOptions[0])
    let [openDialogDelete, setOpenDialogDelete] = useState({ isOpen: false, id: "", description: "" });

    let { onLightbox } = props

    let { loading: loadingProducers, 
            data: dataProducers, 
            error: errorProducers,
            fetchMore: fetchMoreProducers } = useQuery(    queryProducers, { 
                                                            context: { headers: getHeaders(location) }, 
                                                            fetchPolicy: 'cache-first',  
                                                            nextFetchPolicy: 'network-only', 
                                                            notifyOnNetworkStatusChange: true});

    useEffect(() => {
        if (!loadingProducers) {
            if(dataProducers?.producers){
                let { status, data } = dataProducers?.producers
                if(status){
                    // setInput({...input, data, total})
                    setDatas(data)
                }
            }
        }
    }, [dataProducers, loadingProducers])
      
    // const fetchMoreData = async() =>{

    //     // let mores =  await fetchMoreNotifications({ variables: { input: {...search, OFF_SET:search.OFF_SET + 1} } })
    //     // let {status, data} =  mores.data.suppliers
    //     // console.log("status, data :", status, data)
       
    //     if(_.isEqual( input.slice, input.total )){
    //         // setHasMore(false);
    //         setInput({...input, hasMore: false})
    //     }else{
    //         setTimeout(() => {
    //             // let newDatas = [...datas, ...data]
    //             // setDatas(newDatas)
    //             // setSlice(newDatas.length);
    //         }, 1000); 
    //     }
    // }


    const columns = useMemo(
        () => [
          {
            Header: 'Title',
            accessor: 'title',
            Cell: props =>{
                let { original } = props.row
                return <div 
                        onClick={()=>{
                          navigate({
                          pathname: "/d",
                          search: `?${createSearchParams({ id: original._id})}`,
                          state: { id: original._id }
                        })}}>{ original?.title }</div>
            }
          },
          {
            Header: 'Image',
            accessor: 'files',
            Cell: props =>{
                let {files} = props.row.values
                console.log("files :", files)
                return  <div> 
                          <Avatar
                            alt="Avatar"
                            variant="rounded"
                            src={ _.isEmpty(files) ? "" : files[0]?.url}
                            onClick={(e) => {
                              onLightbox({ isOpen: true, photoIndex: 0, images:files })
                            }}
                            sx={{ width: 56, height: 56 }}
                          />
                        </div>
            }
          },
          {
            Header: 'Description',
            accessor: "description",
            Cell: props =>{
              let {description} = props.row.values 
              return <div>{ description }</div>
            }
          },
          {
            Header: 'Price',
            accessor: "price",
            Cell: props => {
              let {price} = props.row.values 
              return  <div>{ price }</div>
            }
          },
          {
            Header: 'Price Unit',
            accessor: "priceUnit",
            Cell: props => {
              let {priceUnit} = props.row.values 
              return  <div>{ priceUnit }</div>
            }
          },
          {
            Header: 'Date',
            accessor: 'createdAt',
            Cell: props => {
              let {createdAt} = props.row.values 
              let date = new Date(createdAt).toLocaleString('en-US', { timeZone: 'asia/bangkok' });
              return <div>{moment(date).format('DD MMM, YYYY h:mm:ss a')}</div>
            }
          },
          {
            Header: 'Edit',
            // accessor: 'createdAt',
            Cell: props => {
              // let {createdAt} = props.row.values 
              // let date = new Date(createdAt).toLocaleString('en-US', { timeZone: 'asia/bangkok' });
              let { original } = props.row
              console.log("props.row.values :", original)
              return  <div>
                        <button onClick={(evt)=>{
                          navigate("/lottery", {state: {from: "/", mode: "edit", id: original?._id } })
                        }}><EditIcon/>{t("edit")}
                        </button>
                        <button onClick={(e)=>{
                          setOpenDialogDelete({ isOpen: true, id: original?._id, description: original?.description });
                        }}><DeleteForeverIcon/>{t("delete")}</button>
                      </div>
            }
          },
        ],
        []
    )
    
    // We need to keep the table from resetting the pageIndex when we
    // Update data. So we can keep track of that flag with a ref.
    const skipResetRef = useRef(false)

    // When our cell renderer calls updateMyData, we'll use
    // the rowIndex, columnId and new value to update the
    // original data
    const updateMyData = (rowIndex, columnId, value) => {
        skipResetRef.current = true
    }
    
    //////////////////////

    const fetchData = useCallback(({ pageSize, pageIndex }) => {
        setPageSize(pageSize)
        setPageIndex(pageIndex)
    })
    
    return (<div className="content-bottom">
            <div className="content-page border"> 
            <Button 
                variant="contained" 
                color="primary"  
                size="small"
                //   disabled={ _.isEmpty(_.filter(input, (b)=>b.bankId == "" || b.bankNumber == "")) ? false : true }
                onClick={(evt)=>{
                    navigate("/lottery", {state: {from: "/", mode: "new"} }) 
                }}>สร้างหวยใหม่</Button>
            <div className="row">
                <TableComp
                    columns={columns}
                    data={datas}
                    fetchData={fetchData}
                    rowsPerPage={pageOptions}
                    updateMyData={updateMyData}
                    skipReset={skipResetRef.current}
                    isDebug={false}/> 
                {/* {
                loadingSubscribes
                ?   <LinearProgress />
                :   input.data.length == 0 
                    ?   <div>Empty data</div>
                    :   <InfiniteScroll
                            dataLength={input.slice}
                            next={fetchMoreData}
                            hasMore={input.hasMore}
                            loader={<h4>Loading...</h4>}>
                            { 
                                _.map(input.data, (item, index) => {                                
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
                } */}
            </div></div></div>);
}

export default ProducersPage