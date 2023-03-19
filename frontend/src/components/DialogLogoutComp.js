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

const DialogLogoutComp = (props) => {
  const {open, logout, onClose} = props

  const handleLogout = () =>{
    logout()
    onClose(true);
  }

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
          <Button onClick={handleLogout} autoFocus>Logout</Button>
        </DialogActions>
      </Dialog> 
  );
};

export default DialogLogoutComp;
