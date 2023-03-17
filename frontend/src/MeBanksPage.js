import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";

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
  Stack,
  SpeedDial,
  SpeedDialIcon,
} from '@mui/material';
import InfiniteScroll from "react-infinite-scroll-component";
import _ from "lodash";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { connect } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import { mutationWithdraw, queryWithdraws } from "./gqlQuery";
import { logout } from "./redux/actions/auth";
import { checkRole, getHeaders, showToast } from "./util";
import { AMDINISTRATOR, UNAUTHENTICATED } from "./constants";
// import TableComp from "./components/TableComp"

const MeBanksPage = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  let { user, logout, onLightbox } = props

  console.log("user :", user)

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
              ?   <label>Empty data</label>
              :   <InfiniteScroll
                      dataLength={slice}
                      next={fetchMoreData}
                      hasMore={hasMore}
                      loader={<h4>Loading...</h4>}>
                      { 
                      _.map(user?.banks, (item, index) => {    
                        return <div>{index}</div>                   
                        // let balance = item.balance;
                        // let status = item.status;
                        // let createdAt = item.createdAt;

                        // return <Stack direction="row" spacing={2} >
                        //           <Box sx={{ width: '8%' }}>{balance}</Box>
                        //           <Box sx={{ width: '10%' }}>{status}</Box>
                        //           <Box sx={{ width: '20%' }}>{(moment(createdAt, 'MM/DD/YYYY HH:mm')).format('DD MMM, YYYY HH:mm A')}</Box>
                        //           <Box sx={{ width: '20%' }}></Box>
                        //       </Stack>
                              
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
                      // let newInput = _.find(datas, (item)=>openDialogDelete.id == item._id.toString())

                      // newInput = _.omitDeep(newInput, ['__v', 'createdAt', 'updatedAt', 'userIdRequest'])
                      // newInput = {...newInput, mode:"DELETE",  balance: parseInt(newInput.balance), dateTranfer:new Date(newInput.dateTranfer)}

                      // console.log("newInput :", newInput)
                      // onMutationWithdraw({ variables: { input: newInput } });
                    }}
                  >{t("delete")}</Button>
                  <Button variant="contained" onClick={handleClose} autoFocus>{t("close")}</Button>
                </DialogActions>
              </Dialog>
            )}

            <SpeedDial
              ariaLabel="SpeedDial basic example"
              sx={{ position: 'absolute', bottom: 16, right: 16 }}
              icon={<SpeedDialIcon />}
              onClick={(e)=>{ 
                navigate("/me+bank", {state: {from: "/", mode: "new"} })
              }}>
            </SpeedDial>
          </div>);
}

const mapStateToProps = (state, ownProps) => {
    return { }
};

const mapDispatchToProps = { logout }
export default connect( mapStateToProps, mapDispatchToProps )(MeBanksPage);