import React, { useState, useEffect, useMemo, useRef, useCallback  } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import deepdash from "deepdash";
import { useQuery } from "@apollo/client";
import CardActionArea from "@material-ui/core/CardActionArea";
import {
  Edit as EditIcon,
  DeleteForever as DeleteForeverIcon
} from '@mui/icons-material'
import moment from "moment";
import {
        Button,
        Dialog,
        DialogActions,
        DialogContent, 
        DialogContentText,
        DialogTitle,
        Box,
        Stack,
        Avatar,
        LinearProgress
      } from '@mui/material';
import InfiniteScroll from "react-infinite-scroll-component";

import { getHeaders, handlerErrorApollo } from "./util"
import { queryAdminWithdraws } from "./gqlQuery"
import * as Constants from "./constants"

import AdminWithdrawsItem from "./item/AdminWithdrawsItem"

deepdash(_);

const AdminWithdrawsPage = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  let { user, logout, onLightbox, onMutationAdminWithdraw } = props

  const [datas, setDatas]             = useState([]);  
  let [total, setTotal] = useState(0)
  let [slice, setSlice] = useState(20);
  let [hasMore, setHasMore] = useState(true)

  const { loading: loadingWithdraws, 
          data: dataWithdraws, 
          error: errorWithdraws,
          networkStatus } = useQuery(queryAdminWithdraws, 
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
      if(!_.isEmpty(dataWithdraws?.adminWithdraws)){
        let { status, code, data } = dataWithdraws.adminWithdraws
        if(status){
          setDatas(_.orderBy(data, i => i.createdAt, 'desc'))
        }
      }
    }
  }, [dataWithdraws, loadingWithdraws])

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
            {
              loadingWithdraws
              ?  <LinearProgress />
              :  datas.length == 0 
                  ?   <label>Empty data</label>
                  :   <InfiniteScroll
                          dataLength={slice}
                          next={fetchMoreData}
                          hasMore={hasMore}
                          loader={<h4>Loading...</h4>}>
                          { 
                          _.map(datas, (item, index) => {

                            console.log("item :", item)

                            let { _id, userId, type } = item
                            // return  <Stack direction="row" spacing={2}>{index} : {i.title}</Stack>

                            // let userId  = item?.userIdRequest;
                            // let files   = item?.files;
                            // let balance = item?.balance;
                            // let bank    = item?.bank;
                            // let dateTranfer   = item?.dateTranfer;
                            // let status  = item?.status;
                            // let createdAt = item?.createdAt;

                            // dateTranfer = new Date(dateTranfer).toLocaleString('en-US', { timeZone: 'asia/bangkok' });
                            // createdAt = new Date(createdAt).toLocaleString('en-US', { timeZone: 'asia/bangkok' });

                            // switch(type){
                            //   case Constants.SUPPLIER:{
                            //     return  <Stack direction="row" spacing={2} >
                            //               <Box>Supplier</Box>
                            //             </Stack>
                            //   }

                            //   case Constants.DEPOSIT:{
                            //     return  <Stack direction="row" spacing={2} >
                            //               <Box>Deposit</Box>
                            //               <Box>
                            //                 <Avatar 
                            //                   sx={{ width: 40, height: 40 }} 
                            //                   src= { _.isEmpty(user?.avatar) ? "" :  user?.avatar?.url ? user?.avatar?.url : URL.createObjectURL(user?.avatar) }
                            //                   variant="rounded" />
                            //               </Box>
                            //               <Box>{user?.displayName}</Box>
                            //               <Box>{item?.balance}</Box>
                            //               <Button 
                            //                 size="small" 
                            //                 variant="contained"
                            //                 onClick={(evt)=>{
                            //                   onMutationAdminWithdraw({ variables: {input: { _id, status: Constants.APPROVED } } });
                            //                 }}>APPROVED</Button>
                            //               <Button 
                            //                 size="small" 
                            //                 variant="outlined" 
                            //                 color="error"
                            //                 onClick={(evt)=>{
                            //                   onMutationAdminWithdraw({ variables: {input: { _id, status: Constants.REJECT } } });
                            //                 }}>REJECT</Button>
                            //             </Stack>
                            //   }

                            //   case Constants.WITHDRAW:{
                            //     return  <Stack direction="row" spacing={2} >
                            //               <Box>Withdraw</Box>
                            //             </Stack>
                            //   }
                            // }

                            return  <AdminWithdrawsItem 
                                      _id={_id}
                                      userId={userId} 
                                      // balance={item?.deposit?.balance} 
                                      onMutationAdminWithdraw={(v)=>onMutationAdminWithdraw(v)}
                                      />

                            return  <Stack direction="row" spacing={2} >
                                      {/* <Box sx={{ width: '10%' }}><UserComp userId={userId} /></Box>
                                      <Box sx={{ width: '7%' }}>
                                      <Avatar
                                        alt="Example avatar"
                                        variant="rounded"
                                        src={files[0]?.url}
                                        onClick={(e) => {
                                          onLightbox({ isOpen: true, photoIndex: 0, images:files })
                                        }}
                                        sx={{ width: 56, height: 56 }}
                                      />
                                      </Box>
                                      <Box sx={{ width: '5%' }}>{balance}</Box>
                                      <Box sx={{ width: '20%' }}>{bank.bankNumber} - {bank.bankName}</Box>
                                      <Box sx={{ width: '15%' }}>{(moment(dateTranfer, 'MM/DD/YYYY HH:mm')).format('DD MMM, YYYY HH:mm A')}</Box>
                                      <Box sx={{ width: '5%' }}>{status}</Box>
                                      <Box sx={{ width: '15%' }}>{(moment(createdAt, 'MM/DD/YYYY HH:mm')).format('DD MMM, YYYY HH:mm A')}</Box>
                                  
                                      <Box sx={{ width: '15%' }}>
                                        <button onClick={(evt)=>{
                                          navigate("/deposit", {state: {from: "/", mode: "edit", id: item?._id} })
                                        }}><EditIcon/>{t("edit")}
                                        </button>
                                        <button onClick={(e)=>{
                                          // setOpenDialogDelete({ isOpen: true, id: item?._id, description: item?.description });
                                        }}><DeleteForeverIcon/>{t("delete")}</button>

                                      </Box> */}
                                    </Stack>
                          })
                        }
                      </InfiniteScroll>
            }
          </div>);
}

export default AdminWithdrawsPage;