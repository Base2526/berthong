import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { useQuery } from "@apollo/client";

import {  
  Edit as EditIcon,
  DeleteForever as DeleteForeverIcon 
} from '@mui/icons-material';

import {
  DialogTitle,
  DialogContentText,
  DialogContent,
  DialogActions,
  Dialog,
  CircularProgress,
  Button,
  Box,
  Stack
} from '@mui/material';
import InfiniteScroll from "react-infinite-scroll-component";
import _ from "lodash";
import moment from "moment";
import { useTranslation } from "react-i18next";
// import { connect } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import { queryWithdraws } from "./gqlQuery";
// import { logout } from "./redux/actions/auth";
import { getHeaders, handlerErrorApollo } from "./util";
// import { AMDINISTRATOR, UNAUTHENTICATED } from "./constants";
// import TableComp from "./components/TableComp"

import * as Constants from "./constants"

const WithdrawsPage = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  let { user, logout, onLightbox, onMutationWithdraw } = props

  const [pageOptions, setPageOptions] = useState([30, 50, 100]);  
  const [pageIndex, setPageIndex]     = useState(0);  
  const [pageSize, setPageSize]       = useState(pageOptions[0])
  const [openDialogDelete, setOpenDialogDelete] = useState({ isOpen: false, id: "", description: "" });
  const [datas, setDatas] = useState([])
  let [total, setTotal] = useState(0)
  let [slice, setSlice] = useState(20);
  let [hasMore, setHasMore] = useState(true)

  const { loading: loadingWithdraws, 
          data: dataWithdraws, 
          error: errorWithdraws, 
          subscribeToMore, 
          networkStatus } = useQuery(queryWithdraws, 
                                      { 
                                        context: { headers: getHeaders(location) }, 
                                        fetchPolicy: 'network-only', 
                                        nextFetchPolicy: 'cache-first', 
                                        notifyOnNetworkStatusChange: true
                                      }
                                    );

  if(!_.isEmpty(errorWithdraws)) handlerErrorApollo( props, errorWithdraws )

  useEffect(() => {
    if(!loadingWithdraws){
      if(!_.isEmpty(dataWithdraws?.withdraws)){
        let { status, data } = dataWithdraws?.withdraws
        if(status)setDatas(data)
      }
    }
  }, [dataWithdraws, loadingWithdraws])


  // const [onMutationWithdraw, resultMutationWithdraw] = useMutation(mutationWithdraw, {
  //   context: { headers: getHeaders(location) },
  //   update: (cache, {data: {withdraw}}) => {
  //     let { data, mode, status } = withdraw

  //     if(status){
  //       switch(mode){
  //         case "delete":{
  //           let data1 = cache.readQuery({ query: queryWithdraws });
  //           let dataFilter =_.filter(data1.withdraws.data, (item)=>data._id != item._id)

  //           cache.writeQuery({
  //             query: queryWithdraws,
  //             data: { withdraws: {...data1.withdraws, data: dataFilter} }
  //           });

  //           handleClose()
  //           break;
  //         }
  //       }
  //     }
  //   },
  //   onCompleted({ data }) {
  //     // history.goBack()
  //   },
  //   onError({error}){
  //     console.log("onError :")
  //   }
  // });
  // console.log("resultMutationWithdraw :", resultMutationWithdraw)

  const handleClose = () => {
    setOpenDialogDelete({ ...openDialogDelete, isOpen: false, description: "" });
  };

    ///////////////////////
    ///////////////
  const fetchData = useCallback(({ pageSize, pageIndex }) => {
    setPageSize(pageSize)
    setPageIndex(pageIndex)
  })
  ///////////////
  const columns = useMemo(
    () => [
      {
        Header: 'Balance',
        accessor: 'balance',
        Cell: props =>{
          let {balance} = props.row.values
          return ( <div style={{ position: "relative" }}>{balance}</div> );
        }
      }, 
      {
        Header: 'Status',
        accessor: 'status',
        Cell: props =>{
          let {status} = props.row.values
          return ( <div style={{ position: "relative" }}>{status}</div> );
        }
      },
      {
        Header: 'Created at',
        accessor: 'createdAt',
        Cell: props => {
          let {createdAt} = props.row.values
          createdAt = new Date(createdAt).toLocaleString('en-US', { timeZone: 'asia/bangkok' });

          return <div>{ (moment(createdAt, 'MM/DD/YYYY HH:mm')).format('DD MMM, YYYY HH:mm A')}</div>
        }
      },
      {
        Header: 'Action',
        Cell: props => {
          let {_id, status, description} = props.row.original
          switch(status){
            case "wait":{
              return  <div className="Btn--posts">
                          <button onClick={(evt)=>{
                            navigate("/withdraw", {state: {from: "/", mode: "edit", id: _id }} )
                          }}><EditIcon/>{t("edit")}</button>
                          <button onClick={(e)=>{
                            setOpenDialogDelete({ isOpen: true, id: _id, description });
                          }}><DeleteForeverIcon/>{t("delete")}</button>
                      </div>
            }
            case "approved":{
              return  <div className="Btn--posts">
                        <button onClick={(e)=>{
                          setOpenDialogDelete({ isOpen: true, id: _id, description });
                        }}><DeleteForeverIcon/>{t("delete")}</button>
                    </div>
            }
            case "reject":{
              return  <div className="Btn--posts">
                        <button onClick={(evt)=>{
                          navigate("/withdraw", {state: {from: "/", mode: "edit", id: _id }} )
                        }}><EditIcon/>{t("edit")}</button>
                        <button onClick={(e)=>{
                          setOpenDialogDelete({ isOpen: true, id: _id, description });
                        }}><DeleteForeverIcon/>{t("delete")}</button>
                      </div>
            }

            default:{
              return <div />
            }
          }             
        }
      },
    ],
    []
  )
    
  // const [data, setData] = useState(() => makeData(10000))
  // const [originalData] = useState(data)

  // We need to keep the table from resetting the pageIndex when we
  // Update data. So we can keep track of that flag with a ref.
  const skipResetRef = useRef(false)

  // When our cell renderer calls updateMyData, we'll use
  // the rowIndex, columnId and new value to update the
  // original data
  const updateMyData = (rowIndex, columnId, value) => {
    console.log("updateMyData")
    // We also turn on the flag to not reset the page
    skipResetRef.current = true
    // setData(old =>
    //   old.map((row, index) => {
    //     if (index === rowIndex) {
    //       return {
    //         ...row,
    //         [columnId]: value,
    //       }
    //     }
    //     return row
    //   })
    // )
  }
  //////////////////////

  const fetchMoreData = async() =>{
    // let mores =  await fetchMoreUsers({ variables: { input: {...search, OFF_SET:search.OFF_SET + 1} } })
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
              loadingWithdraws
              ?  <CircularProgress />
              :  datas.length == 0 
                  ?   <label>Empty data</label>
                  :   <InfiniteScroll
                          dataLength={slice}
                          next={fetchMoreData}
                          hasMore={hasMore}
                          loader={<h4>Loading...</h4>}>
                          { 
                          _.map(datas, (item, index) => {                       
                            let balance = item.balance;
                            let status = item.status;
                            let createdAt = item.createdAt;

                            return <Stack direction="row" spacing={2} >
                                      <Box sx={{ width: '8%' }}>{balance}</Box>
                                      <Box sx={{ width: '10%' }}>{status}</Box>
                                      <Box sx={{ width: '20%' }}>{(moment(createdAt, 'MM/DD/YYYY HH:mm')).format('DD MMM, YYYY HH:mm A')}</Box>
                                      <Box sx={{ width: '20%' }}></Box>
                                  </Stack>
                                  
                          })
                        }
                      </InfiniteScroll>
            }
            {openDialogDelete.isOpen && (
              <Dialog
                open={openDialogDelete.isOpen}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
              >
                <DialogTitle id="alert-dialog-title">{t("confirm_delete")}</DialogTitle>
                <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                    {openDialogDelete.description}
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      let newInput = _.find(datas, (item)=>openDialogDelete.id == item._id.toString())

                      newInput = _.omitDeep(newInput, ['__v', 'createdAt', 'updatedAt', 'userIdRequest'])
                      newInput = {...newInput, mode:"DELETE",  balance: parseInt(newInput.balance), dateTranfer:new Date(newInput.dateTranfer)}

                      console.log("newInput :", newInput)
                      onMutationWithdraw({ variables: { input: newInput } });
                    }}
                  >{t("delete")}</Button>
                  <Button variant="contained" onClick={handleClose} autoFocus>{t("close")}</Button>
                </DialogActions>
              </Dialog>
            )}
          </div>);
}

export default WithdrawsPage;