import React  from "react";
import {
  DialogTitle,
  DialogContentText,
  DialogContent,
  Dialog,
  DialogActions,
  Button
} from "@mui/material"

const DialogLogoutComp = (props) => {
  const {open, onLogout, onClose} = props

  const handleClose = () => onClose(true)
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      fullWidth
      maxWidth="sm">
      <DialogTitle id="alert-dialog-title">
        Comfirm logout
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Are you such logout?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        {/* <Button onClick={handleClose}>Close</Button>
        <Button onClick={()=>onLogout()} autoFocus>Logout</Button> */}
         <Button variant="contained" onClick={()=>onLogout()} autoFocus className="btn-deposit">
             Logout
          </Button>
          <Button variant="contained" onClick={handleClose} className="btn-withdraw">
             Close
          </Button>
      </DialogActions>
    </Dialog> 
  )
}

export default DialogLogoutComp;
