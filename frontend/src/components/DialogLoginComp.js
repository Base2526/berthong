import React, { useEffect, useState, useMemo } from "react";
import { 
  Lock as LockIcon,
  Google as GoogleIcon,
  Facebook as FacebookIcon
}from '@mui/icons-material';
import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle
} from "@mui/material";
import { gapi } from "gapi-script";
import _ from "lodash";
import { useDeviceData } from "react-device-detect";
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import { GoogleLogin } from "react-google-login";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import {
  TextField,
  Button
} from "@material-ui/core";
import line from '../line.svg';

const DialogLoginComp = (props) => {
  const { t } = useTranslation();
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const facebookAppId =  process.env.REACT_APP_FACEBOOK_APPID
  const navigate = useNavigate();
  const deviceData = useDeviceData();

  let { onComplete, onClose, open, updateProfile, onMutationLogin, onMutationLoginWithSocial } = props;
  let [input, setInput]   = useState({ username: "",  password: ""});

  useEffect(()=>{
    const initClient = () =>{
      gapi.client.init({
        clientId: googleClientId,
        scope: ""
      })
    }
    gapi.load("client:auth2", initClient)
  }, [])

  const callbackFacebook = (response) => {
    if(!_.has(response, "status")){
      onMutationLoginWithSocial({ variables: { input: { authType: "FACEBOOK",  data: response, deviceAgent: JSON.stringify(deviceData)  }} })
    }
  }

  // https://github.com/Sivanesh-S/react-google-authentication/blob/master/src/utils/refreshToken.js
  const onGoogleSuccess = async(response) => {
    onMutationLoginWithSocial({ variables: { input: { authType: "GOOGLE",  data: {...response, ...await response.reloadAuthResponse()}, deviceAgent: JSON.stringify(deviceData)  }} })
  };

  const onGoogleFailure = (response) =>{
    console.log("onGoogleFailure :", response);
  };

  const handleSubmit = (event, type) =>{
    event.preventDefault();
    onMutationLogin({ variables: { input: { username: _.trim(input.username),  password: _.trim(input.password), deviceAgent: JSON.stringify(deviceData) }} })
  }

  const onInputChange = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const formUserLogin = () =>{
    return  <form onSubmit={(evt)=>handleSubmit(evt, "manual")}>
              <div className="row">
                <div className="col-12">
                  <div className="row">
                      <div className="col-12 pl-2 pr-2 pb-2">
                        <TextField
                          id="standard-basic"
                          label={t("username")}
                          variant="filled"
                          name="username" value={input.username} onChange={onInputChange} required
                        />
                      </div>
                  </div>
                  <div className="row">
                      <div className="col-12 pl-2 pr-2 pb-2">
                        <TextField
                          id="standard-basic"
                          type="password"
                          label={t("password")}
                          variant="filled"
                          name="password" value={input.password} onChange={onInputChange} required
                        />
                      </div>
                  </div>
                  <div className="row">
                    <div className="col-12 pb-2 text-center">
                      <div className="row">
                      <div className="col-6 text-center">
                        <Button variant="contained" className="btn-confirm" type="submit" style={{width:"100%"}}>
                         {t("login")}
                        </Button>
                      </div>
                      <div className="col-6 text-center">
                        <Button disabled variant="contained" className="btn-dis" style={{width:"100%"}}>
                            สมัครสมาชิก
                        </Button>
                      </div>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-lg-12 col-12 pb-2 text-center" style={{justifyContent:"center"}}>
                      <a class="d-flex btn btn-social btn-facebook" >
                      <FacebookIcon/>
                      <span className="font14" style={{marginLeft:"20px"}}>Sign in with Facebook</span>
                      </a>
                    </div>
                    <div className="col-lg-12 col-12 pb-2 text-center" style={{justifyContent:"center"}}>
                      <a class="d-flex btn btn-social btn-google" >
                      <GoogleIcon/>
                      <span className="font14" style={{marginLeft:"20px"}}>Sign in with Google</span>
                      </a>
                    </div>
                    <div className="col-lg-12 col-12pb-2 text-center" style={{justifyContent:"center"}}>
                      <a class="d-flex btn btn-social btn-line" >
                      <img style={{width:"24px"}} src={line} />
                      <span className="font14" style={{marginLeft:"20px"}}>Sign in with Line</span>
                      </a>
                    </div>
                  </div>




                  {/* <div className="d-flex form-input">
                    <label>{t("username")}</label>
                    <div className="position-relative wrapper-form">
                      <input type="text" className="input-bl-form" name="username" value={input.username} onChange={onInputChange} required/>
                      <AccountCircle />
                    </div>
                  
                  </div>
                  <div className="d-flex form-input">
                    <label>{t("password")}</label>
                    <div className="position-relative wrapper-form">
                      <input type="password" className="input-bl-form" name="password" value={input.password} onChange={onInputChange} required />
                      <LockIcon />
                    </div>
                  </div>
                  <button type="submit">{t("login")}</button> */}
                </div>
              </div>
            </form>
  }

  const onGithubSuccess = async(response) =>{
    console.log("onGithubSuccess :", response)

    let {code} = response
    if(!_.isEmpty(code)){
      onMutationLoginWithSocial({ variables: { input: { authType: "GITHUB",  data: response, deviceAgent: JSON.stringify(deviceData)}} })
    }
  }

  const onGithubFailure = (response) =>{
      console.log("onGithubFailure :", response)
  }

  return  useMemo(() => {
            return (
              <Dialog onClose={(e)=>{ onClose(false) }} open={open}>
                <DialogTitle className="text-center">{t("welcome_to_berthong")}</DialogTitle>
                {/* <DialogContent>
                  <DialogContentText id="alert-dialog-description" className="text-center">Get a free account, no credit card required</DialogContentText>
                </DialogContent> */}
                <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                    { formUserLogin() }
                    {/* <div className="d-flex flex-wrap">
                      <GoogleLogin
                        clientId={googleClientId}
                        render={renderProps => (
                          <button onClick={renderProps.onClick} disabled={renderProps.disabled}><GoogleIcon /> <span> Google</span> </button>
                        )}
                        buttonText="Login"
                        onSuccess={onGoogleSuccess}
                        onFailure={onGoogleFailure}
                        cookiePolicy={'single_host_origin'}
                      />
                      <FacebookLogin
                        className={"facebookLogin"}
                        appId={facebookAppId}
                        autoLoad={false}
                        fields="name,email,picture"
                        callback={callbackFacebook} 
                        render={renderProps => (
                          <button onClick={renderProps.onClick}><FacebookIcon/> <span>Facebook </span></button>
                        )}/>
                    </div> */}
                  </DialogContentText>
                  </DialogContent>
                  {/* <DialogContent className="text-center">
                      <Typography variant="body2" color="text.secondary">By continuing, you agree to Banlist Terms of Service, Privacy Policy</Typography>
                  </DialogContent> */}
              </Dialog>    
            )
          }, [input]);
};

export default DialogLoginComp;
