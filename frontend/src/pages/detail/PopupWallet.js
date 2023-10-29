import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from "@material-ui/core";
import _ from "lodash"

const PopupWallet = (props) => {
  const navigate = useNavigate();
  let { user, data } = props

  let selecteds =  _.filter(data?.buys, (buy)=>_.isEqual(buy?.userId, user?._id) && _.isEqual(buy?.selected, 0) )

  const cancelForm = () => {
    props.onClose();
  };

  const saveForm = (e) => {
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
            จำนวนเงินคงเหลือ { user?.balance } บาท <br />
            มีการจอง จำนวน { selecteds.length } เบอร์ ราคา { selecteds.length * data?.priceUnit } บาท
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={()=>{ navigate({ pathname: "/deposit" }) }} variant="contained" className="btn-confirm">
          เติมเงิน
        </Button>
        <Button onClick={()=>{ navigate({ pathname: "/withdraw" }) }} variant="contained" color="secondary">
          ถอนเงิน
        </Button>
        <Button onClick={()=>{ navigate({ pathname: "/history-transitions" }) }} variant="contained" color="primary">
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
