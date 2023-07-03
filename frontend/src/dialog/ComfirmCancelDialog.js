import React, { useState, useEffect } from "react";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useLocation } from "react-router-dom";
import { useMutation } from "@apollo/client";

import { getHeaders, showToast, handlerErrorApollo} from "../util";
// import { checkRole, getHeaders, handlerErrorApollo, showToast} from "./util";
import { mutationCancelBuyAll } from "../gqlQuery"

const ComfirmCancelDialog = (props) => {
    const location = useLocation();
    let { id, open, onClose } = props

    const [onMutationCancelBuyAll, resultMutationCancelBuyAll] = useMutation(mutationCancelBuyAll,{
        context: { headers: getHeaders(location) },
        update: (cache, {data: {cancelBuyAll}}) => {
          let { status, data } = cancelBuyAll
    
          //   console.log("update : ", buy)
          //   setPopupOpenedShoppingBag(false)
          //   showToast("success", `การส่งซื้อ complete`)
        },
        onCompleted(data) {
          console.log("onCompleted :", data)
          showToast("success", "ดำเนินการเรียบร้อย")

          handleClose();
        },
        onError: (error) => {
          console.log("onError :", error)
          return handlerErrorApollo( props, error )
        }
    });
  
    const handleOK = () => {
      onMutationCancelBuyAll({ variables: { id } })
    };
  
    const handleClose = () => {
      onClose(false);
    };
  
    return (
      <div>
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Comfirm</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Comfirm cancel order?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Close</Button>
            <Button onClick={handleOK} autoFocus>OK</Button>
          </DialogActions>
        </Dialog>
      </div>
    );
}

export default ComfirmCancelDialog;