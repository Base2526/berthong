import React, { useEffect, useState, useMemo } from "react";
import { useMutation } from "@apollo/client";
import { 
  Lock as LockIcon,
  Google as GoogleIcon,
  Facebook as FacebookIcon
}from '@mui/icons-material';
import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle, 
  Typography
} from "@mui/material";
import { gapi } from "gapi-script";
import _ from "lodash";
import { useDeviceData } from "react-device-detect";
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import { GoogleLogin } from "react-google-login";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { mutationLogin, mutationLoginWithSocial } from "../gqlQuery";
import { USER_NOT_FOUND } from "../constants";
import { showToast } from "../util";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import line from '../line.svg';

const DialogLoginComp = (props) => {
  const { t } = useTranslation();
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const facebookAppId =  process.env.REACT_APP_FACEBOOK_APPID
  const navigate = useNavigate();
  const deviceData = useDeviceData();

  let { onComplete, onClose, open, updateProfile } = props;

  let [input, setInput]   = useState({ username: "",  password: ""});
  
  const [onLogin, resultLogin] = useMutation(mutationLogin, {
    update: (cache, {data:{login}}) => {
      let {status, data, sessionId} = login
      if(status){
        localStorage.setItem('token', sessionId)

        updateProfile(data)
        onComplete()
      }
    },
    onCompleted(data) {
      console.log("onCompleted :", data)
    },
    onError(error){
      _.map(error?.graphQLErrors, (e)=>{
        switch(e?.extensions?.code){
          case USER_NOT_FOUND:{
            showToast("error", error?.message)
            break;
          }
        }
      })
    }
  });

  const [onLoginWithSocial, resultLoginWithSocial] = useMutation(mutationLoginWithSocial, 
    {
      update: (cache, {data: {loginWithSocial}}) => {

        // console.log("loginWithSocial :", loginWithSocial)
        // const data1 = cache.readQuery({ query: gqlBanks });

        let {status, data, sessionId} = loginWithSocial

        if(status){
          localStorage.setItem('token', sessionId)

          onComplete(data)
        }

        // let newBanks = {...data1.banks}
        // let newData  = _.map(newBanks.data, bank=>bank._id == updateBank._id ? updateBank : bank)

        // newBanks = {...newBanks, data: newData}
        // cache.writeQuery({
        //   query: gqlBanks,
        //   data: { banks: newBanks },
        // });
      },
      onCompleted({ data }) {
        // history.push("/");
        navigate("/")
      },
      onError({error}){
        console.log("onError :")
      }
    }
  );

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
      onLoginWithSocial({ variables: { input: { authType: "FACEBOOK",  data: response, deviceAgent: JSON.stringify(deviceData)  }} })
    }
  }

  // https://github.com/Sivanesh-S/react-google-authentication/blob/master/src/utils/refreshToken.js
  const onGoogleSuccess = async(response) => {
    onLoginWithSocial({ variables: { input: { authType: "GOOGLE",  data: {...response, ...await response.reloadAuthResponse()}, deviceAgent: JSON.stringify(deviceData)  }} })
  };

  const onGoogleFailure = (response) =>{
    console.log("onGoogleFailure :", response);
  };

  const handleSubmit = (event, type) =>{
    event.preventDefault();
    onLogin({ variables: { input: { username: _.trim(input.username),  password: _.trim(input.password), deviceAgent: JSON.stringify(deviceData) }} })
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
      onLoginWithSocial({ variables: { input: { authType: "GITHUB",  data: response, deviceAgent: JSON.stringify(deviceData)}} })
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
