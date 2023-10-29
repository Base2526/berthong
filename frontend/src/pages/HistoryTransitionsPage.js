import React, { useState, useEffect } from "react";
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

import { getHeaders, numberCurrency } from "../util"
import { queryHistoryTransitions, queryAdminBanks } from "../apollo/gqlQuery"
import * as Constants from "../constants"
deepdash(_);

const HistoryTransitionsPage = (props) => {
  const location = useLocation();
  const { t } = useTranslation();
  const [openDialogDelete, setOpenDialogDelete] = useState({ isOpen: false, id: "", description: "" });

  let [banks, setBanks] = useState([]);
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
                                                                                                  fetchPolicy: 'cache-first',
                                                                                                  nextFetchPolicy: 'network-only',
                                                                                                  notifyOnNetworkStatusChange: true 
                                                                                                });

  const { loading: loadingAdminBanks, 
          data: dataAdminBanks, 
          error: errorAdminBanks, 
          networkStatus: networkStatusAdminBanks } =  useQuery(queryAdminBanks, 
                                                        { 
                                                          context: { headers: getHeaders(location) }, 
                                                          fetchPolicy: 'cache-first', 
                                                          nextFetchPolicy: 'network-only', 
                                                          notifyOnNetworkStatusChange: true
                                                        }
                                                      );

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
          setDatas(_.orderBy(data, i => i.createdAt, 'desc'))
        }
      }
    }
  }, [dataHistoryTransitions, loadingHistoryTransitions])

  useEffect(() => {
    if(!loadingAdminBanks){
      if(!_.isEmpty(dataAdminBanks?.adminBanks)){
        let { status, data } = dataAdminBanks?.adminBanks
        if(status){
          setBanks(data)
        }
      }
    }
  }, [dataAdminBanks, loadingAdminBanks])

  const handleClose = () => {
    setOpenDialogDelete({ ...openDialogDelete, isOpen: false, description: "" });
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

  const ItemView = (value, index) =>{
    console.log("ItemView :", value)
    switch(value?.type){
      case Constants.SUPPLIER:{
        return  <div class="alert alert-danger p-1 m-1" role="alert">
                  <Stack key={index} direction="row" spacing={2}>
                    <Box>Supplier</Box>
                    <Box>ยอดซื้อ : { numberCurrency(value.balance) }</Box>
                    <Box>{ value.status == Constants.WAIT ? "รอดำเนินการ" : value.status == Constants.APPROVED ? "สำเร็จ" : "ยกเลิก" }</Box>
                    <Box>{ moment(value.createdAt).format('MMMM Do YYYY, h:mm:ss a') }</Box>
                  </Stack>
                </div>
      }

      case Constants.DEPOSIT:{
        console.log("Constants.DEPOSIT :", value)
        return  <div class="alert alert-warning p-1 m-1" role="alert">
                  <Stack key={index} direction="row" spacing={2}>
                    <Box>Deposit</Box>
                    <Box>ยอดฝาก : { numberCurrency(value?.deposit?.balance) }</Box>
                    {
                      loadingAdminBanks 
                      ? <LinearProgress />
                      : <Box>{ _.find(banks, (bank)=>_.isEqual(value?.deposit?.bankId, bank.id))?.label }</Box>
                    }
                    <Box>{ value.status == Constants.WAIT ? "รอดำเนินการ" : value.status == Constants.APPROVED ? "สำเร็จ" : "ยกเลิก" }</Box>
                    <Box>{ moment(value.createdAt).format('MMMM Do YYYY, h:mm:ss a') }</Box>
                  </Stack>
                </div>
      }

      case Constants.WITHDRAW:{
        return  <div class="alert alert-success p-1 m-1" role="alert">
                  <Stack key={index} direction="row" spacing={2}>
                    <Box>Withdraw</Box>
                    <Box>ยอดถอน : { numberCurrency(value?.withdraw?.balance) }</Box>
                    <Box>{ value.status == Constants.WAIT ? "รอดำเนินการ" : value.status == Constants.APPROVED ? "สำเร็จ" : "ยกเลิก" }</Box>
                    <Box>{ moment(value.createdAt).format('MMMM Do YYYY, h:mm:ss a') }</Box>
                  </Stack>
                </div>
      }
    }
  }

  // return  useMemo(() => {
  return (<div className="content-bottom">
            <div className="content-page border">
              <div className="row">
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
                          { _.map(datas, (item, index) => ItemView(item, index)) }
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
          </div></div></div>)
          // }, [datas, loadingHistoryTransitions]);
}

export default HistoryTransitionsPage