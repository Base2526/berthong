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
import { useQuery } from "@apollo/client";
import { useTranslation } from "react-i18next";
import InfiniteScroll from "react-infinite-scroll-component";
import moment from "moment";

import { queryBookBuyTransitions } from "./gqlQuery"
import UserComp from "./components/UserComp"
import { getHeaders } from "./util"

import ComfirmCancelDialog from "./dialog/ComfirmCancelDialog"

const BookBuysPage = (props) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  let { user, onLightbox } = props

  let [datas, setDatas] = useState([]);
  let [total, setTotal] = useState(0)
  let [slice, setSlice] = useState(20);
  let [hasMore, setHasMore] = useState(true)
  let [openComfirmCancelDialog, setOpenComfirmCancelDialog] = useState({ isOpen: false, id: "" })

  let [openDialogDelete, setOpenDialogDelete] = useState({ isOpen: false, id: "", description: "" });

  const { loading: loadingBookBuyTransitions, 
          data: dataBookBuyTransitions, 
          error: errorBookBuyTransitions, 
          subscribeToMore, 
          networkStatus } = useQuery(queryBookBuyTransitions, { 
                                                                context: { headers: getHeaders(location) }, 
                                                                fetchPolicy: 'network-only',
                                                                nextFetchPolicy: 'cache-first', 
                                                                notifyOnNetworkStatusChange: true
                                                              });

  useEffect(() => {
    if (!loadingBookBuyTransitions) {
      if(dataBookBuyTransitions?.bookBuyTransitions){
        let { status, data } = dataBookBuyTransitions?.bookBuyTransitions
        if(status){
          setDatas(data)
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
    {openComfirmCancelDialog.isOpen && <ComfirmCancelDialog id={openComfirmCancelDialog.id} open={openComfirmCancelDialog.isOpen} onClose={()=>setOpenComfirmCancelDialog({...openComfirmCancelDialog, isOpen: false})}  />}
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
                    let title = item.title;
                    let description = item.description;
                    let type   = item.type;
                    let category  = item.category;
                    let condition = item.condition;
                    let buys    = item.buys;
                    let follows = item.follows;
                    let files   = item?.files
                    let createdAt = new Date(item.createdAt).toLocaleString('en-US', { timeZone: 'asia/bangkok' });
          
                    return  <div className="content-bottom">
                              <div className="content-page border">   
                              <div className="row">
                                <Stack direction="row" spacing={2} >
                                  <Box sx={{ width: '10%' }}>
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
                                  <Box 
                                    sx={{ width: '10%' }}
                                    onClick={()=>{
                                      navigate({
                                      pathname: "/d",
                                      search: `?${createSearchParams({ id: item._id})}`,
                                      state: { id: item._id }
                                    })}}
                                  >{title}</Box>
                                  <Box sx={{ width: '20%' }}>{description}</Box>
                                  <Box sx={{ width: '20%' }}><UserComp userId={item?.ownerId} /></Box>
                                  <Box sx={{ width: '5%' }}>{type}</Box>
                                  <Box sx={{ width: '5%' }}>{category}</Box>
                                  <Box sx={{ width: '5%' }}>{condition}</Box>
                                  <Box sx={{ width: '5%' }}>{buys.length}</Box>
                                  <Box sx={{ width: '5%' }}>{follows.length}</Box>
                                  <Box sx={{ width: '10%' }}>{ (moment(createdAt, 'MM/DD/YYYY HH:mm')).format('DD MMM, YYYY HH:mm A') }</Box>
                                  <Box sx={{ width: '10%' }}><Button onClick={(evt)=>onCancelOrder(item?._id)}>Cancel Order</Button></Box>
                                </Stack>
                              </div>
                              </div>
                            </div>
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