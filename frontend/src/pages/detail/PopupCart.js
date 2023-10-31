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
    
  let books = _.filter(data?.buys, buy => buy.selected == 0) 
  console.log("books :", books)
  const cancelForm = () => {
    onClose();
  };

  const saveConfirm = (e) => {
    onMutationBuy({ variables: { id: data?._id} })
  };

  let length = 100
  if(data?.number_lotter){
    switch(data?.number_lotter){
      case 1: {
        length = 1000
        break
      }
      default: 
      {
        length = 100
        break
      }
    }
  }

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
              // overflow: "scroll"
            }}
          >
            จำนวน {books?.length} เบอร์
            <br />
            { _.map(books, (buy, i) => { return minTwoDigits(buy?.itemId, length.toString().length) }).join(', ') }
            <br />
            รวมราคา {books.length * data?.priceUnit} บาท
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