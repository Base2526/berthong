import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from "@material-ui/core";

const PopupWallet = (props) => {
  const cancelForm = () => {
    console.log("Form is canceled.");
    props.onClose();
  };

  const saveForm = (e) => {
    console.log("Saving form...");
    props.onClose();
  };

  return (
    <Dialog open={props.opened} onClose={cancelForm} fullWidth={true}>
      <DialogTitle>กระเป๋าตังค์</DialogTitle>
      <DialogContent>
        <div style={{ overflow: "hidden", height: "100%", width: "100%" }}>
          <div
            style={{
              paddingRight: 17,
              height: "100%",
              width: "100%",
              boxSizing: "content-box",
              overflow: "scroll"
            }}
          >
            จำนวนเงินคงเหลือ 2,000 บาท <br />
            มีการจอง จำนวน 1 เบอร์ ราคา 200 บาท
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={saveForm} variant="contained" className="btn-confirm">
          เติมเงิน
        </Button>
        <Button onClick={saveForm} variant="contained" color="secondary">
          ถอนเงิน
        </Button>
        <Button onClick={saveForm} variant="contained" color="primary">
          ประวัติ
        </Button>
        <Button onClick={saveForm} variant="contained" color="info">
          ปิด
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PopupWallet;
