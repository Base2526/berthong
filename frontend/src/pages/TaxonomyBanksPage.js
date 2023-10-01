import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import _ from "lodash"
import {
  Box,
  Typography,
  DialogTitle,
  DialogContentText,
  DialogContent,
  DialogActions,
  Dialog,
  Button,
  CircularProgress,
  SpeedDialIcon,
  SpeedDial,
  Stack
} from '@mui/material';
import {  DeleteForever as DeleteForeverIcon, 
          Edit as EditIcon } from '@mui/icons-material';
import { useQuery } from "@apollo/client";
import { useTranslation } from "react-i18next";
import InfiniteScroll from "react-infinite-scroll-component";

import { queryBanks } from "../apollo/gqlQuery"
import { getHeaders, handlerErrorApollo } from "../util"
import * as Constants from "../constants"

const TaxonomyBanksPage = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const [datas, setDatas]             = useState([]);  
  let [total, setTotal] = useState(0)
  let [slice, setSlice] = useState(20);
  let [hasMore, setHasMore] = useState(false)

  const [openDialogDelete, setOpenDialogDelete] = useState({ isOpen: false, id: "", description: "" });

  const { loading: loadingBanks, 
          data: dataBanks, 
          error: errorBanks,
          networkStatus: networkStatusBanks } = useQuery(queryBanks, 
                                                  { 
                                                    context: { headers: getHeaders(location) }, 
                                                    fetchPolicy: 'network-only', // Used for first execution
                                                    nextFetchPolicy: 'cache-first', // Used for subsequent executions
                                                    notifyOnNetworkStatusChange: true
                                                  }
                                                );

  if(!_.isEmpty(errorBanks)) handlerErrorApollo( props, errorBanks )

  useEffect(() => {
    if(!loadingBanks){
      if(!_.isEmpty(dataBanks?.banks)){
        let { status, code, data } = dataBanks.banks
        if(status)setDatas(data)
      }
    }
  }, [dataBanks, loadingBanks])

  const handleClose = () => {}
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
    <div>
      {
        loadingBanks
        ?  <CircularProgress />
        :  datas.length == 0 
            ? <label>Empty data</label>
            : <InfiniteScroll
                dataLength={slice}
                next={fetchMoreData}
                hasMore={hasMore}
                loader={<h4>Loading...</h4>}>
                { 
                  _.map(datas, (item, index) => {
                    let _id    = item?._id;
                    let name   = item?.name;
                    // let description = item.description;
                    return  <Stack direction="row" spacing={2} >
                              <Box sx={{ width: '60%' }}>{name}</Box>
                              <Box sx={{ width: '40%' }}>
                                <button onClick={(evt)=>{
                                  navigate("/taxonomy-bank", {state: {from: "/", mode: "edit", _id}})
                                }}><EditIcon/>{t("edit")}</button>
                                <button onClick={(e)=>{ }}><DeleteForeverIcon/>{t("delete")}</button>
                              </Box>
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
            <DialogContentText id="alert-dialog-description">{openDialogDelete.description}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={() => {
                // handleDelete(openDialogDelete.id);
                // setOpenDialogDelete({ isOpen: false, id: "", description: "" });
              }}
            >{t("delete")}</Button>
            <Button variant="contained" onClick={handleClose} autoFocus>{t("close")}</Button>
          </DialogActions>
        </Dialog>
      )}
      <SpeedDial
        ariaLabel=""
        sx={{ position: 'absolute', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
        onClick={(e)=>{
          navigate("/bank", {state: {from: "/", mode: "new"} })
        }}
      />
    </div>
  );
};

export default TaxonomyBanksPage;
