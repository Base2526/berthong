import React from "react";
import Button from "@material-ui/core/Button";
import { withStyles } from "@material-ui/core/styles";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import Typography from "@material-ui/core/Typography";
//import MuiDialogTitle from "@material-ui/core/DialogTitle";
//import MuiDialogContent from "@material-ui/core/DialogContent";
// import MuiDialogActions from "@material-ui/core/DialogActions";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";

function SimpleDialog(props) {
  const { open, handleClose } = props;

  const styles = (theme) => ({
    root: {
      margin: 0,
      padding: theme.spacing(2)
    },
    closeButton: {
      position: "absolute",
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500]
    }
  });

  // if you want to customize the styling

  // const DialogContent = withStyles(theme => ({
  //   root: {
  //     padding: theme.spacing(2)
  //   }
  // }))(MuiDialogContent);

  // const DialogActions = withStyles(theme => ({
  //   root: {
  //     margin: 0,
  //     padding: theme.spacing(1)
  //   }
  // }))(MuiDialogActions);

  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="simple-dialog-title"
      open={open}
    >
      <DialogTitle>Modal title</DialogTitle>
      <DialogContent dividers>
        <Typography gutterBottom>
          Cras mattis consectetur purus sit amet fermentum. Cras justo odio,
          dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac
          consectetur ac, vestibulum at eros.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleClose} color="primary">
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function Test() {
  // const [selectedValue] = React.useState([]);
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      {/* <Typography variant="subtitle1">{selectedValue}</Typography> */}
      <br />
      <Button onClick={handleOpen} variant="outlined" color="primary">
        Open simple dialog
      </Button>
      <SimpleDialog open={open} handleClose={handleClose} />
    </div>
  );
}
