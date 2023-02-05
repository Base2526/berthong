import React, {useEffect, useState, forwardRef} from "react";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Typography from "@mui/material/Typography";
import { useHistory } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { useDeviceData } from "react-device-detect";
import AccountCircle from "@material-ui/icons/AccountCircle";
import LockIcon from '@mui/icons-material/Lock';
import FacebookIcon from '@mui/icons-material/Facebook';
import GoogleIcon from '@mui/icons-material/Google';
import { FacebookLoginButton, GoogleLoginButton } from "react-social-login-buttons";
import { GoogleLogin, useGoogleLogin  } from "react-google-login";
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import _ from "lodash";
import { gapi } from "gapi-script"
import LoginGithub from 'react-login-github';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useTranslation } from "react-i18next";
import Slide from '@mui/material/Slide';
import Button from '@mui/material/Button';

import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import TextField from '@mui/material/TextField';


import { mutationLogin, mutationLoginWithSocial } from "./gqlQuery"

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const DialogBuy = (props) => {
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
      open={open}
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

export default DialogBuy;
