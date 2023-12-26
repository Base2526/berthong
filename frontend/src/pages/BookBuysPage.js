import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, createSearchParams } from "react-router-dom";
import {
  Stack,
  DialogTitle,
  DialogContentText,
  DialogContent,
  DialogActions,
  Dialog,
  Button,
  Box,
  Avatar,
  LinearProgress
} from '@mui/material'
import _ from "lodash"
import { useQuery, useMutation } from "@apollo/client";
import { useTranslation } from "react-i18next";
import InfiniteScroll from "react-infinite-scroll-component";
import moment from "moment";
import deepdash from "deepdash";

import { queryBookBuyTransitions, mutationCancelTransition, mutationBuy, querySupplierById, querySuppliers } from "../apollo/gqlQuery"
import UserComp from "../components/UserComp"
import { getHeaders, showToast, handlerErrorApollo, minTwoDigits } from "../util"
import ComfirmCancelDialog from "../dialog/ComfirmCancelDialog"
import * as Constants from "../constants"
import PopupCart from "./detail/PopupCart";

deepdash(_);

let initOpenComfirmCancelDialog = { isOpen: false, id: "" }

const BookBuysPage = (props) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  let { user, onLightbox, updateProfile } = props

  let [datas, setDatas] = useState([]);
  let [total, setTotal] = useState(0)
  let [slice, setSlice] = useState(20);
  let [hasMore, setHasMore] = useState(true)
  let [openComfirmCancelDialog, setOpenComfirmCancelDialog] = useState(initOpenComfirmCancelDialog)

  let [openDialogDelete, setOpenDialogDelete] = useState({ isOpen: false, id: "", description: "" });
  let [isPopupOpenedShoppingBag, setPopupOpenedShoppingBag] = useState({ isOpen: false, data: null });

  const [onMutationBuy, resultMutationBuy] = useMutation(mutationBuy,{
    context: { headers: getHeaders(location) },
    update: (cache, {data: {buy}}) => {
      let { status, transitionId, data:newData, user } = buy
      if(status){
        updateProfile(user)

        let querySupplierByIdValue = cache.readQuery({ query: querySupplierById, variables: {id: newData._id} });
        if(status && querySupplierByIdValue){
          cache.writeQuery({
            query: querySupplierById,
            data: { supplierById: {...querySupplierByIdValue.supplierById, data: newData} },
            variables: { id: newData._id }
          })
        }  

        ////////// update cache querySuppliers ///////////
        let suppliersValue = cache.readQuery({ query: querySuppliers });
        if(!_.isNull(suppliersValue)){
          let { suppliers } = suppliersValue
          let suppliersData = _.map(suppliers.data, (supplier) => supplier._id == newData._id ? newData : supplier)
          cache.writeQuery({
            query: querySuppliers,
            data: { suppliers: { ...suppliersValue.suppliers, data: suppliersData } }
          });
        }
        ////////// update cache querySuppliers ///////////

        ////////// update cache BookBuyTransitions /////////////
        let queryBookBuyTransitionsValue = cache.readQuery({ query: queryBookBuyTransitions });
        if(status && queryBookBuyTransitionsValue){       
          let newTransitions =  _.map(queryBookBuyTransitionsValue.bookBuyTransitions.data, (item)=>{
                                  if(item._id == transitionId){
                                    return  {...item, status: Constants.APPROVED, supplier: newData}
                                  }
                                  return item
                                })

          cache.writeQuery({
            query: queryBookBuyTransitions,
            data: { bookBuyTransitions: { ...queryBookBuyTransitionsValue.bookBuyTransitions, data: newTransitions } },
          });
        }  
        ////////// update cache BookBuyTransitions /////////////
      }          
    },
    onCompleted(data) {
      setPopupOpenedShoppingBag({...isPopupOpenedShoppingBag, isOpen:false})
      showToast("success", `การส่งซื้อ complete`)
    },
    onError: (error) => {
      console.log("onError :", error)

      showToast("error", `เกิดปัญหาในการสั่งซื้อ`)

      return handlerErrorApollo( props, error )
    }
  });

  const [onMutationCancelTransition, resultMutationCancelTransition] = useMutation(mutationCancelTransition,{
    context: { headers: getHeaders(location) },
    update: (cache, {data: {cancelTransition}}) => {
      let { status, data: newData } = cancelTransition

      let queryBookBuyTransitionsValue = cache.readQuery({ query: queryBookBuyTransitions });
      if(status && queryBookBuyTransitionsValue){       
        cache.writeQuery({
          query: queryBookBuyTransitions,
          data: { bookBuyTransitions: { ...queryBookBuyTransitionsValue.bookBuyTransitions, 
                                        data: _.filter(queryBookBuyTransitionsValue.bookBuyTransitions.data, (item)=> item._id.toString() !== newData._id.toString() )  } },
        });
      }      
    },
    onCompleted(data) {
      setOpenComfirmCancelDialog(initOpenComfirmCancelDialog)
      showToast("success", "ดำเนินการเรียบร้อย")
    },
    onError: (error) => {
      return handlerErrorApollo( props, error )
    }
  });

  const { loading: loadingBookBuyTransitions, 
          data: dataBookBuyTransitions, 
          error: errorBookBuyTransitions, 
          subscribeToMore, 
          networkStatus } = useQuery(queryBookBuyTransitions, { 
                                                                context: { headers: getHeaders(location) }, 
                                                                fetchPolicy: 'cache-first' ,
                                                                nextFetchPolicy: 'network-only', 
                                                                notifyOnNetworkStatusChange: true
                                                              });

  useEffect(() => {
    if (!loadingBookBuyTransitions) {
      if(dataBookBuyTransitions?.bookBuyTransitions){
        let { status, data: newData } = dataBookBuyTransitions?.bookBuyTransitions
        if(status){
          if(!_.isEqual(newData, datas)) {
            setDatas(_.orderBy(newData, i => i.createdAt, 'desc'))
          }
        }
      }
    }
  }, [dataBookBuyTransitions, loadingBookBuyTransitions])

  const handleClose = () => {
    setOpenDialogDelete({ ...openDialogDelete, isOpen: false });
  };

  const onCancelOrder = (id)=>{
    setOpenComfirmCancelDialog({ ...openComfirmCancelDialog, isOpen: true, id });
  }

  const handleDelete = (id) => {
    // onDeleteBank({ variables: { id } });
  };

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

  return (
    <div className="user-list-container">
      { isPopupOpenedShoppingBag.isOpen && <PopupCart {...props} onMutationBuy={(evt)=>onMutationBuy(evt)} opened={isPopupOpenedShoppingBag.isOpen} data={isPopupOpenedShoppingBag.data} onClose={() => setPopupOpenedShoppingBag({...isPopupOpenedShoppingBag, isOpen:false}) } /> }
      { openComfirmCancelDialog.isOpen && <ComfirmCancelDialog id={openComfirmCancelDialog.id} open={openComfirmCancelDialog.isOpen} onMutationCancelTransition={onMutationCancelTransition} onClose={()=>setOpenComfirmCancelDialog({...openComfirmCancelDialog, isOpen: false})}  />}
      {
        loadingBookBuyTransitions
        ?  <LinearProgress />
        :  datas.length == 0 
            ? <label>Empty data</label>
            : <InfiniteScroll
                dataLength={slice}
                next={fetchMoreData}
                hasMore={false}
                loader={<h4>Loading...</h4>}>
                { 
                  _.map(datas, (item, index) => {

                    let { supplier }= item
                    let ref         = item._id;
                    let title       = supplier.title;
                    let description = supplier.description;
                    let type        = supplier.type;
                    let category    = supplier.category;
                    let condition   = supplier.condition;                    
                    let buy         = _.filter(supplier.buys, (it)=>it.userId == user._id && it.selected == 1 &&  it.transitionId == item._id)
                    let book        = _.filter(supplier.buys, (it)=>it.userId == user._id && it.selected == 0 &&  it.transitionId == item._id)
                    let follows     = supplier.follows;
                    let files       = supplier?.files
                    let createdAt   = new Date(supplier.createdAt).toLocaleString('en-US', { timeZone: 'asia/bangkok' });
                    let status      = item?.status

                    let length = 100
                    if(supplier?.number_lotter){
                      switch(supplier?.number_lotter){
                        case 1: {
                          length = 1000
                          break
                        }
                        default: 
                        {
                          length = 100
                          break
                        }
                      }
                    }

                    return  <div className="content-bottom" key={index}>
                              <div className="row">
                                <Stack direction="row" spacing={2} >
                                  {/* <Box>{ref.toString()}</Box> */}
                                  <Box sx={{ width: '10%' }}>
                                    <Avatar
                                      alt="Example avatar"
                                      variant="rounded"
                                      src={files[0]?.url}
                                      onClick={(e) => {
                                        onLightbox({ isOpen: true, photoIndex: 0, images:files })
                                      }}
                                      sx={{ width: 56, height: 56 }}/>
                                  </Box>
                                  <Box 
                                    sx={{ width: '15%' }}
                                    onClick={()=>{
                                      navigate({
                                      pathname: "/d",
                                      search: `?${createSearchParams({ id: supplier._id})}`,
                                      state: { id: supplier._id }
                                    })}}
                                  >{title}</Box>
                                  {/* <Box sx={{ width: '20%' }}>{description}</Box> */}
                                  {/* <Box sx={{ width: '20%' }}><UserComp userId={supplier?.ownerId} /></Box> */}
                                  {/* 
                                      <Box sx={{ width: '5%' }}>{type}</Box>
                                      <Box sx={{ width: '5%' }}>{category}</Box> 
                                  */}
                                  {/* <Box sx={{ width: '5%' }}>Condition : {condition}</Box> */}
                                  <Box sx={{ width: '10%' }}>Book : { book.length * supplier.priceUnit }({ _.map(book, (vl) => `${ minTwoDigits(vl.itemId, length.toString().length) }`).join(",") })</Box>
                                  <Box sx={{ width: '10%' }}>Buy : { buy.length * supplier.priceUnit }({ _.map(buy, (vl) => `${ minTwoDigits(vl.itemId, length.toString().length) }`).join(",") })</Box>
                                  <Box sx={{ width: '20%' }}>{status == Constants.WAIT ? <Button onClick={(evt)=>{ setPopupOpenedShoppingBag({ isOpen:true, data:supplier }) }} variant="contained" color="warning">คลิกเพือสั่งซื้อ</Button> : status == Constants.APPROVED ? "รายการสั่งซื้อสมบูรณ์" : "รายการสั่งซื้อถูกยกเลิก"}</Box>
                                  {/* <Box sx={{ width: '10%' }}>{ (moment(createdAt, 'MM/DD/YYYY HH:mm')).format('DD MMM, YYYY HH:mm A') }</Box> */}
                                  {/* <Box sx={{ width: '10%' }}><Button onClick={(evt)=>onCancelOrder(supplier?._id)}>Cancel Order</Button></Box> */}
                                </Stack>
                              </div>
                              {/* </div> */}
                            </div>
                  })
                }
              </InfiniteScroll>
      }

      {/*   */}

      {openDialogDelete.isOpen && (
        <Dialog
          open={openDialogDelete.isOpen}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{t("confirm_delete")}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">{openDialogDelete.description}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={() => {
                handleDelete(openDialogDelete.id);

                setOpenDialogDelete({ isOpen: false, id: "", description: "" });
              }}
            >{t("delete")}</Button>
            <Button variant="contained" onClick={handleClose} autoFocus>{t("close")}</Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};
export default BookBuysPage