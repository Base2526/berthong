import { useMutation } from "@apollo/client";
import AccountCircle from "@material-ui/icons/AccountCircle";
import FacebookIcon from '@mui/icons-material/Facebook';
import GoogleIcon from '@mui/icons-material/Google';
import LockIcon from '@mui/icons-material/Lock';
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import { gapi } from "gapi-script";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { useDeviceData } from "react-device-detect";
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import { GoogleLogin } from "react-google-login";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { mutationLogin, mutationLoginWithSocial } from "./gqlQuery";

import { USER_NOT_FOUND } from "./constants";
import { showToast } from "./util";

const DialogLogin = (props) => {
  const { t } = useTranslation();
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const facebookAppId =  process.env.REACT_APP_FACEBOOK_APPID
  const navigate = useNavigate();
  const deviceData = useDeviceData();

  let { login, onComplete, onClose, open } = props;

  let [input, setInput]   = useState({ username: "",  password: ""});
  
  const [onLogin, resultLogin] = useMutation(mutationLogin, {
    update: (cache, {result}) => {
      let {status, data, sessionId} = result.login
      if(status){
        localStorage.setItem('token', sessionId)

        login(data)
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
    onLogin({ variables: { input: { username: input.username,  password: input.password, deviceAgent: JSON.stringify(deviceData) }} })
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
              <div className="d-flex form-input">
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
              <button type="submit">{t("login")}</button>
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

  return (
    <Dialog onClose={(e)=>{ onClose(false) }} open={open}>
      <DialogTitle className="text-center">{t("welcome_to_berthong")}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description" className="text-center">Get a free account, no credit card required</DialogContentText>
      </DialogContent>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          { formUserLogin() }
          <div className="d-flex flex-wrap">
            <GoogleLogin
              clientId={googleClientId}
              render={renderProps => (
                <button onClick={renderProps.onClick} disabled={renderProps.disabled}><GoogleIcon /> <span> Google</span> </button>
              )}
              buttonText="Login"
              onSuccess={onGoogleSuccess}
              onFailure={onGoogleFailure}
              cookiePolicy={'single_host_origin'}
              // isSignedIn={true}
            />
            <FacebookLogin
              className={"facebookLogin"}
              appId={facebookAppId}
              autoLoad={false}
              // fields="name,email,picture"
              // onClick={(e)=>{
              //   console.log("FacebookLogin :", e)
              // }}
              fields="name,email,picture"
              callback={callbackFacebook} 
              render={renderProps => (
                <button onClick={renderProps.onClick}><FacebookIcon/> <span>Facebook </span></button>
              )}/>
            {/* <LoginGithub 
              clientId={process.env.REACT_APP_GITHUB_CLIENT_ID}
              onSuccess={onGithubSuccess}
              onFailure={onGithubFailure}
              className={"login-github"}
              children={<React.Fragment><i className="left"><GitHubIcon /></i><span>Github</span></React.Fragment>}/> */}
          </div>
        </DialogContentText>
        </DialogContent>
        <DialogContent className="text-center">
            <Typography variant="body2" color="text.secondary">By continuing, you agree to Banlist Terms of Service, Privacy Policy</Typography>
        </DialogContent>
    </Dialog>    
  );
};

export default DialogLogin;
