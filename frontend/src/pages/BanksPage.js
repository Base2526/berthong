import React, { useState } from "react";
import {  
  Edit as EditIcon,
  DeleteForever as DeleteForeverIcon 
} from '@mui/icons-material';
import {
  TbMoodEmpty as TbMoodEmptyIcon
} from "react-icons/tb"
import {
  DialogTitle,
  DialogContentText,
  DialogContent,
  DialogActions,
  Dialog,
  Button,
  Box,
  Stack,
  SpeedDial,
  SpeedDialIcon,
  LinearProgress
} from '@mui/material';
import InfiniteScroll from "react-infinite-scroll-component";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";

import { queryBankById } from "../apollo/gqlQuery"
import { getHeaders } from "../util"

const BanksPage = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  let { user } = props

  const [openDialogDelete, setOpenDialogDelete] = useState({ isOpen: false, id: "", description: "" });
  let [total, setTotal] = useState(0)
  let [slice, setSlice] = useState(20);
  let [hasMore, setHasMore] = useState(true)

  const handleClose = () => {
    setOpenDialogDelete({ ...openDialogDelete, isOpen: false, description: "" });
  };

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
              user?.banks.length == 0 
              ?   <Stack>
                    <div>
                      <TbMoodEmptyIcon size="1.5em"/>
                      <label>Empty data</label>
                    </div>
                    <Button 
                      variant="contained"
                      onClick={(e)=>{ 
                        navigate("/bank", {state: {from: "/", mode: "new"} })
                      }}>เพิ่ม บัญชีธนาคารใหม่</Button>
                  </Stack>
              :   <InfiniteScroll
                    dataLength={slice}
                    next={fetchMoreData}
                    hasMore={false}
                    loader={<h4>Loading...</h4>}>
                    { 
                      _.map(user?.banks, (item, index) => {   
                         
                        let _id = item._id;              
                        let bankNumber = item.bankNumber;
                        let bankId = item.bankId;

                        const { loading: loadingBankById, 
                                data: dataBankById, 
                                error: errorBankById,
                                refetch: refetchBankById} = useQuery(queryBankById, {
                                                          context: { headers: getHeaders(location) }, 
                                                          variables: {id: bankId},
                                                          fetchPolicy: 'cache-first', // Used for first execution
                                                          nextFetchPolicy: 'network-only', // Used for subsequent executions
                                                          notifyOnNetworkStatusChange: true,
                                                        });

                    
                        return  <Stack ke={index} direction="row" spacing={2} >
                                  <Box sx={{ width: '30%' }}>{bankNumber}</Box>
                                  {
                                    loadingBankById 
                                    ? <LinearProgress />
                                    : <Box sx={{ width: '30%' }}>{dataBankById?.bankById?.data?.name}</Box>
                                  }
                                  <Box sx={{ width: '40%' }}>
                                    <div className="Btn--posts">
                                      <button onClick={(evt)=>{
                                        navigate("/bank", {state: {from: "/", mode: "edit", id: _id} })
                                      }}><EditIcon/>{t("edit")}</button>
                                      <button onClick={(e)=>{
                                        setOpenDialogDelete({ isOpen: true, id: _id });
                                      }}><DeleteForeverIcon/>{t("delete")}</button>
                                    </div>
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
                  <DialogContentText id="alert-dialog-description">
                    {openDialogDelete.description}
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button
                    variant="outlined"
                    onClick={() =>{}}
                  >{t("delete")}</Button>
                  <Button variant="contained" onClick={handleClose} autoFocus>{t("close")}</Button>
                </DialogActions>
              </Dialog>
            )}

            <SpeedDial
              ariaLabel=""
              sx={{ position: 'absolute', bottom: 16, right: 16 }}
              icon={<SpeedDialIcon />}
              onClick={(e)=>{ navigate("/bank", {state: {from: "/", mode: "new"} }) }}>
            </SpeedDial>
          </div>);
}

export default BanksPage;