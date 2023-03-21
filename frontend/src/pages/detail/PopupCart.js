import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from "@material-ui/core";

const PopupCart = (props) => {
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
      <DialogTitle>ยืนยันการซื้อ</DialogTitle>
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
            จำนวน {props.dataSelect.length} เบอร์
            <br />
            {props.dataSelect.length !== 0
              ? String(props.dataSelect)
              : "ยังไม่ได้เลือก"}
            <br />
            รวมราคา {props.dataSelect.length * 100} บาท
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={saveForm} variant="contained" className="btn-confirm">
          ยืนยันการซื้อ
        </Button>
        <Button onClick={saveForm} variant="contained" color="warning">
          ปิด
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PopupCart;
