import React, { useState } from "react";
import {
  DialogTitle,
  DialogContentText,
  DialogContent,
  Dialog,
  DialogActions,
  Button
} from "@mui/material"
import _ from "lodash";

const DialogLogout = (props) => {
  const {open, onClose} = props

  // const [open, setOpen] = useState(false);
  // const handleClickOpen = () => {
  //   setOpen(true);
  // };

  const handleClose = () => {
    onClose(true);
  };

  return (
    <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Comfirm logout
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you such logout?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
          <Button onClick={handleClose} autoFocus>Logout</Button>
        </DialogActions>
      </Dialog> 
  );
};

export default DialogLogout;
