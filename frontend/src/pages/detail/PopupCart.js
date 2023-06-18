import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from "@material-ui/core";

import _ from "lodash"
import {  minTwoDigits } from "../../util"

const PopupCart = (props) => {

  let { data, opened, onMutationBuy, onClose } = props
    
  const cancelForm = () => {
    onClose();
  };

  const saveConfirm = (e) => {
    onMutationBuy({ variables: { id: data?._id} })
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
            จำนวน {data?.buys?.length} เบอร์
            <br />
            { _.map(data?.buys, (buy, i) => { return minTwoDigits(buy?.itemId) }).join(', ') }
            <br />
            รวมราคา {data?.buys?.length * data?.price} บาท
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button disabled={ _.find(data?.buys, (v, k)=>v.selected === 0) === undefined ? true : false } onClick={saveConfirm} variant="contained" className="btn-confirm">ยืนยันการซื้อ</Button>
        <Button onClick={cancelForm} variant="contained" color="warning">ปิด</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PopupCart;