import React, { forwardRef } from "react";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import CloseIcon from '@mui/icons-material/Close';
import {
  Slide,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  TextField,
  Dialog,
  DialogContent,
  Typography
} from "@mui/material";

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const DialogBuyPage = (props) => {
  let { t } = useTranslation();
  let { user, data, onBuy, onClose } = props

  let buys =  _.filter(data.buys, (buy)=>buy.selected==0 && buy.userId == user._id)

  console.log("DialogBuy data :", props, buys)

  const handleClickOpen = () => {
    // setOpen(true);
  };

  const handleClose = () => {
    // setOpen(false);
  };
    
  return (
    <Dialog 
      fullScreen
      onClose={(e)=>{ onClose() }} 
      // open={open}
      TransitionComponent={Transition}>
      <AppBar sx={{ position: 'relative' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={()=>onClose()}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            ยืนยันคำสั่งซื้อ
          </Typography>
          {/* <Button autoFocus color="inherit" onClick={()=>onClose()}>ยกเลิก</Button> */}
          <Button autoFocus color="inherit" onClick={()=>onBuy()}>ยืนยัน</Button>
        </Toolbar>
      </AppBar>
      <DialogContent>
        <div>ชื่อ {data.title}</div>
        <div>งวดวันที่ 12-03-2565</div>
        <div>{ _.map(buys, buy=><div>{buy.itemId}</div>) }</div>
        <TextField
          id="standard-multiline-static"
          label="บันทึกช่วยจำ"
          multiline
          rows={4}
          defaultValue=""
          variant="filled"/>
        <div>Credit คงเหลือ : 15000</div>
        <div>ใช้ Credit ทั้งหมด : 100</div>
      </DialogContent>
    </Dialog>    
  );
};

export default DialogBuyPage;
