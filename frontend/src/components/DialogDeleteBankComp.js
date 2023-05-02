import React  from "react";
import {
  DialogTitle,
  DialogContentText,
  DialogContent,
  Dialog,
  DialogActions,
  Button
} from "@mui/material"

const DialogDeleteBankComp = (props) => {
  const {data, onDelete, onClose} = props

  console.log("DialogDeleteBankComp :", data)

  const handleClose = () => onClose(true)
  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={data?.open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description">
      <DialogTitle id="alert-dialog-title">
        Comfirm delete
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Are you such delete bank?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
        <Button onClick={()=>onDelete(data?.id)} autoFocus>Delete</Button>
      </DialogActions>
    </Dialog> 
  )
}

export default DialogDeleteBankComp;
