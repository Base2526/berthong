import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import deepdash from "deepdash";
import { useQuery } from "@apollo/client";
import {
  Stack,
  DialogTitle,
  DialogContentText,
  DialogContent,
  DialogActions,
  Dialog,
  Button,
  LinearProgress,
  Box
} from "@mui/material"
import InfiniteScroll from "react-infinite-scroll-component";
import moment from "moment";

import { getHeaders } from "./util"
import { queryHistoryTransitions } from "./gqlQuery"
import * as Constants from "./constants"
deepdash(_);

const HistoryTransitionsPage = (props) => {
  const location = useLocation();
  const { t } = useTranslation();
  const [openDialogDelete, setOpenDialogDelete] = useState({ isOpen: false, id: "", description: "" });

  let [datas, setDatas] = useState([]);
  let [total, setTotal] = useState(0)
  let [slice, setSlice] = useState(20);
  let [hasMore, setHasMore] = useState(true)

  const { loading: loadingHistoryTransitions, 
          data: dataHistoryTransitions, 
          error: errorHistoryTransitions, 
          subscribeToMore: subscribeToMoreHistoryTransitions, 
          networkStatus: networkStatusHistoryTransitions } = useQuery(queryHistoryTransitions, { 
                                                                                                  context: { headers: getHeaders(location) }, 
                                                                                                  fetchPolicy: 'network-only',
                                                                                                  nextFetchPolicy: 'cache-first',
                                                                                                  notifyOnNetworkStatusChange: true 
                                                                                                });

  /*
  ฝาก
  - จำนวนเงิน
  - วันที่โอนเงิน ชม/นาที
  - สลิปการโอน
  */

  /*
  ถอน 
  - ชือบัญชี
  - ยอดเงิน
  */

  useEffect(() => {
    if (!loadingHistoryTransitions) {
      if(dataHistoryTransitions?.historyTransitions){
        let { status, data } = dataHistoryTransitions?.historyTransitions
        if(status){
          setDatas(data)
        }
      }
    }
  }, [dataHistoryTransitions, loadingHistoryTransitions])

  const handleClose = () => {
    setOpenDialogDelete({ ...openDialogDelete, isOpen: false, description: "" });
  };

  ///////////////////////
  ///////////////
  // const fetchData = useCallback(({ pageSize, pageIndex }) => {
  //   setPageSize(pageSize)
  //   setPageIndex(pageIndex)
  // })
  ///////////////
  // const columns = useMemo(
  //     () =>{

  //       console.log("props.row.original : ", user)

  //       switch(checkRole(user)){
  //         case AMDINISTRATOR:{
  //           return [
  //             {
  //               Header: 'Type',
  //               accessor: 'type',
  //               Cell: props =>{
  //                   let {type} = props.row.values
  //                   return ( <div style={{ position: "relative" }}>{type}</div> );
  //               }
  //             },
  //             {
  //               Header: 'Balance',
  //               accessor: 'balance',
  //               Cell: props => {
  //                 let {balance} = props.row.values
  //                 return ( <div style={{ position: "relative" }}>{balance}</div> );
  //               }
  //             },
  //             {
  //               Header: 'Bank',
  //               accessor: 'bank',
  //               Cell: props => {
  //                 let {bank} = props.row.values
  //                 return <div>{bank[0].bankName} {bank[0].bankNumber}</div>
  //               }
  //             },
  //             // 
  //             {
  //               Header: 'User Approve',
  //               accessor: 'userNameApprove',
  //               Cell: props => {
  //                 let {userNameApprove} = props.row.values
  //                 return <div>{userNameApprove} {userNameApprove}</div>
  //               }
  //             },
  //             {
  //               Header: 'Created at',
  //               accessor: 'createdAt',
  //               Cell: props => {
  //                   let {createdAt} = props.row.values
  //                   return <div>{createdAt}</div>
  //               }
  //             }
  //           ]
  //         }
  //         case AUTHENTICATED:{
  //           return [
  //             {
  //               Header: 'Type',
  //               accessor: 'type',
  //               Cell: props =>{
  //                   let {type} = props.row.values
  //                   return ( <div style={{ position: "relative" }}>{type}</div> );
  //               }
  //             },
  //             {
  //               Header: 'Title',
  //               accessor: 'title',
  //               Cell: props =>{
  //                   let {title} = props.row.values
  //                   return ( <div style={{ position: "relative" }}>{title}</div> );
  //               }
  //             },
  //             {
  //               Header: 'Balance',
  //               accessor: 'balance',
  //               Cell: props => {
  //                 let {balance} = props.row.values
  //                 return ( <div style={{ position: "relative" }}>{balance}</div> );
  //               }
  //             },
  //             {
  //               Header: 'Description',
  //               accessor: 'description',
  //               Cell: props => {
  //                 let {description} = props.row.values
  //                 return ( <div style={{ position: "relative" }}>{description}</div> );
  //               }
  //             },
  //             {
  //               Header: 'Created at',
  //               accessor: 'createdAt',
  //               Cell: props => {
  //                 let {createdAt} = props.row.values
  //                 createdAt = new Date(createdAt).toLocaleString('en-US', { timeZone: 'asia/bangkok' });
  //                 return <div>{ (moment(createdAt, 'MM/DD/YYYY HH:mm')).format('DD MMM, YYYY HH:mm A')}</div>
  //               }
  //             }, 
  //             {
  //               Header: 'updated at',
  //               accessor: 'updatedAt',
  //               Cell: props => {
  //                   let {updatedAt} = props.row.values
  //                   updatedAt = new Date(updatedAt).toLocaleString('en-US', { timeZone: 'asia/bangkok' });
  //                   return <div>{ (moment(updatedAt, 'MM/DD/YYYY HH:mm')).format('DD MMM, YYYY HH:mm A')}</div>
  //               }
  //             },
  //           ]
  //         }
  //       }
  //     } ,
  //     []
  // )
  
  // const [data, setData] = useState(() => makeData(10000))
  // const [originalData] = useState(data)

  // We need to keep the table from resetting the pageIndex when we
  // Update data. So we can keep track of that flag with a ref.
  // const skipResetRef = useRef(false)

  // When our cell renderer calls updateMyData, we'll use
  // the rowIndex, columnId and new value to update the
  // original data
  // const updateMyData = (rowIndex, columnId, value) => {
  //   console.log("updateMyData")
  //   // We also turn on the flag to not reset the page
  //   skipResetRef.current = true
  //   // setData(old =>
  //   //   old.map((row, index) => {
  //   //     if (index === rowIndex) {
  //   //       return {
  //   //         ...row,
  //   //         [columnId]: value,
  //   //       }
  //   //     }
  //   //     return row
  //   //   })
  //   // )
  // }
  //////////////////////

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

  const ItemView = (value, index) =>{
    switch(value?.type){
      case Constants.SUPPLIER:{
        return  <Stack key={index} direction="row" spacing={2}>
                  <Box>Supplier</Box>
                  <Box>ยอดฝาก : { value.balance }</Box>
                  <Box>{ value.status == Constants.WAIT ? "รอดำเนินการ" : value.status == Constants.APPROVED ? "สำเร็จ" : "ยกเลิก" }</Box>
                  <Box>{ moment(value.createdAt).format('MMMM Do YYYY, h:mm:ss a') }</Box>
                </Stack>
      }

      case Constants.DEPOSIT:{
        return  <Stack key={index} direction="row" spacing={2}>
                  <Box>Deposit</Box>
                  <Box>ยอดฝาก : { value?.balance }</Box>
                  <Box>{ _.find(Constants.BANKS, (bank)=>_.isEqual(value?.bankId, bank.id))?.label }</Box>
                  <Box>{ value.status == Constants.WAIT ? "รอดำเนินการ" : value.status == Constants.APPROVED ? "สำเร็จ" : "ยกเลิก" }</Box>
                  <Box>{ moment(value.createdAt).format('MMMM Do YYYY, h:mm:ss a') }</Box>
                  {/* {
                    value.status == Constants.WAIT
                    ? <Button 
                        variant="outlined" 
                        onClick={(evt)=>{
                          onMutationDeposit({ variables: { input: {_id: value?._id, type: Constants.CANCEL } } });
                        }}>ยกเลิก</Button>
                    :""
                  } */}
                </Stack>
      }

      case Constants.WITHDRAW:{
        return  <Stack key={index} direction="row" spacing={2}>
                  <Box>Withdraw</Box>
                  <Box>ยอดฝาก : { value.balance }</Box>
                  <Box>{ value.status == Constants.WAIT ? "รอดำเนินการ" : value.status == Constants.APPROVED ? "สำเร็จ" : "ยกเลิก" }</Box>
                  <Box>{ moment(value.createdAt).format('MMMM Do YYYY, h:mm:ss a') }</Box>
                </Stack>
      }
    }
  }

  // return  useMemo(() => {
  return (<div style={{flex:1}}>
            {
              loadingHistoryTransitions
              ?  <LinearProgress />
              :  datas.length == 0 
                  ?   <label>Empty data</label>
                  :   <InfiniteScroll
                          dataLength={slice}
                          next={fetchMoreData}
                          hasMore={false}
                          loader={<h4>Loading...</h4>}>
                          { 
                          _.map(datas, (item, index) => {
                            console.log("item :", item)
                            return ItemView(item, index)
                            // console.log("datas :", datas)
                            // 0: 'supplier', 1: 'deposit',  2: 'withdraw'
                            // return  <Stack key={index} direction="row" spacing={2}>
                            //           <Box>{ item.type == 0 ? "Supplier" : item.type == 1 ? "Deposit" : "Withdraw" }</Box>
                            //           <Box>ยอดฝาก : { item.balance }</Box>
                            //           <Box>{ item.status == Constants.WAIT ? "รอดำเนินการ" : item.status == Constants.APPROVED ? "สำเร็จ" : "ยกเลิก" }</Box>
                            //           <Box>{ moment(item.createdAt).format('MMMM Do YYYY, h:mm:ss a') }</Box>
                            //         </Stack>
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
                      // let newInput = _.find(depositsValue.data.deposits.data, (item)=>openDialogDelete.id == item._id.toString())

                      // newInput = _.omitDeep(newInput, ['__v', 'createdAt', 'updatedAt', 'userIdRequest'])
                      // newInput = {...newInput, mode:"DELETE",  balance: parseInt(newInput.balance), dateTranfer:new Date(newInput.dateTranfer)}

                      // onMutationDeposit({ variables: { input: newInput } });
                    }}
                  >{t("delete")}</Button>
                  <Button variant="contained" onClick={handleClose} autoFocus>{t("close")}</Button>
                </DialogActions>
              </Dialog>
            )}
          </div>)
          // }, [datas, loadingHistoryTransitions]);
}

export default HistoryTransitionsPage