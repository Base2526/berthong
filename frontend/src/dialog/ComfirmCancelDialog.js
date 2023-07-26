import React from "react";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useLocation } from "react-router-dom";

const ComfirmCancelDialog = (props) => {
    let { id, open, onMutationCancelTransition, onClose } = props
  
    const handleOK = () => {
      onMutationCancelTransition({ variables: { id } })
    }
  
    const handleClose = () => {
      onClose(false);
    }
  
    return (
      <div>
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description">
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