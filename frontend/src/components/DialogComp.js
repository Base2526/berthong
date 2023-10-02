import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const DialogComp = (props) => {
    const { open, data, onHandleClose } = props
    return (
        <Dialog
            open={open}
            onClose={onHandleClose}
            scroll={"paper"}
            aria-labelledby="scroll-dialog-title"
            aria-describedby="scroll-dialog-description"
        >
            <DialogTitle id="scroll-dialog-title">Detail</DialogTitle>
            <DialogContent dividers={true}>
            <DialogContentText
                id="scroll-dialog-description"
                // ref={descriptionElementRef}
                tabIndex={-1}
            >{JSON.stringify(data)}</DialogContentText>
            </DialogContent>
            <DialogActions>
            <Button onClick={onHandleClose}>Close</Button>
            </DialogActions>
        </Dialog>
    )
}

export default DialogComp;