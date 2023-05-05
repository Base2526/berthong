import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from "@material-ui/core";

const PopupCart = (props) => {

  let { data, opened, onClose } = props
  
  const cancelForm = () => {
    onClose();
  };

  const saveForm = (e) => {
    onClose();
  };

  return (
    <Dialog open={opened} onClose={cancelForm} fullWidth={true}>
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
            จำนวน {data?.length} เบอร์
            <br />
            {data?.length !== 0
              ? String(data)
              : "ยังไม่ได้เลือก"}
            <br />
            รวมราคา {data?.length * 100} บาท
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
