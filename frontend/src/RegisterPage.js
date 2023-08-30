import React , {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useApolloClient } from "@apollo/client";
import { useDeviceData } from "react-device-detect";
import _ from "lodash";
import AccountCircle from "@material-ui/icons/AccountCircle";
import EmailSharpIcon from '@mui/icons-material/EmailSharp';
import LockIcon from '@mui/icons-material/Lock';
import {
    Stack,
    DialogTitle,
    DialogContentText,
    DialogContent,
    DialogActions,
    Dialog,
    Button,
    Box,
    Avatar,
    LinearProgress
  } from '@mui/material'

import { loadCaptchaEnginge, LoadCanvasTemplate , validateCaptcha} from "react-simple-captcha";
import { checkRole, getHeaders, handlerErrorApollo, showToast} from "./util";
import { mutationRegister } from "./gqlQuery"

let initValues = { username: "", email: "",  password: "", confirm_password: "", captcha: "" }
const RegisterPage = (props) => {
    let navigate = useNavigate();
    // let deviceData = useDeviceData();
    // let client = useApolloClient();

    let [input, setInput]   = useState(initValues);
    let [error, setError]   = useState({password_not_match: ""});


    if(!_.isEmpty(props?.user)){
        navigate("/me")
    }

    const [onRegister, resultRegister] = useMutation(mutationRegister, { 
        update: (cache, {data: {register}}) => {
            console.log("update :", register)
        },
        onCompleted(data){
            console.log("onCompleted :", data)
            let { status } = data.register

            if(status){
                showToast("success", `สมัครสมาชิกเรียบร้อย`)

                navigate("/")
            }else{
                showToast("error", `ไม่สามารถสมัครสมาชิก กรุณาติดต่อเจ้าหน้าที่`)
            }
        },
        onError(error){
            return handlerErrorApollo( props, error )
        }
    });

    if(resultRegister.called && !resultRegister.loading){
        console.log("resultRegister :", resultRegister)
    }

    useEffect( () => {
        loadCaptchaEnginge(8);
    },[]);

    const onInputChange = (e) => {
        const { name, value } = e.target;

        setInput((prev) => ({
          ...prev,
          [name]: value
        }));

        validateInput(e);
    };

    const validateInput = (e) => {
        let { name, value } = e.target;
        setError((prev) => {
          const stateObj = { ...prev, [name]: "" };
          switch (name) {
            case "password": {
                if (!_.isEqual(input.confirm_password, value)) {
                    stateObj["password_not_match"] = `Passwords do NOT match`;
                }else{
                    stateObj["password_not_match"] = ``
                }
                break;
            }
            case "confirm_password": {
                if (!_.isEqual(value, input.password)) {
                    stateObj["password_not_match"] = `Passwords do NOT match`;
                }else{
                    stateObj["password_not_match"] = ``
                }
                break;
            }

            default:
              break;
          }
          return stateObj;
        });
    };

    const submitForm = (event) =>{
        onRegister({ variables: { input: _.omit(input, ['confirm_password', 'captcha']) } })
    }

    return (<div className="page-userlog pl-2 pr-2">
                <div className="Mui-usercontainerss">
                    <form >
                        <div className="d-flex form-input">
                            <label>Username </label>
                            <div className="position-relative wrapper-form">
                                <input type="text" name="username" className="input-bl-form" value={input.username} onChange={onInputChange} />
                                <AccountCircle />
                            </div>         
                        </div>
                        <div className="d-flex form-input">
                            <label>Email </label>
                            <div className="position-relative wrapper-form">
                                <input type="email" name="email" className="input-bl-form" value={input.email} onChange={onInputChange} />
                                <EmailSharpIcon />
                            </div>
                        </div>
                        <div className="d-flex form-input">
                            <label>Password </label>
                            <div className="position-relative wrapper-form">
                                <input type="password" name="password" className="input-bl-form" value={input.password} onChange={onInputChange} />
                                <LockIcon/>
                            </div>
                        </div>
                        <div className="d-flex form-input">
                            <label>Confirm password </label>
                            <div className="position-relative wrapper-form">
                                <input type="password" name="confirm_password" className="input-bl-form" value={input.confirm_password} onChange={onInputChange} />
                                <LockIcon/>
                            </div>
                            <p className="text-red-500"> {_.isEmpty(error.password_not_match) ? "" : error.password_not_match} </p>
                        </div>
                        <div className="">
                            <LoadCanvasTemplate reloadText="Reload Captcha" reloadColor="red" />
                            <div  className="input-block">
                                <input 
                                    type="text"  
                                    id="captcha" 
                                    name="captcha" 
                                    placeholder="Enter the Captcha"
                                    onChange={(evt)=> setInput({...input, captcha: evt.target.value}) }
                                    autoComplete="off"/>
                            </div>
                        </div>
                        <Button 
                            variant="contained" 
                            color="warning" 
                            disabled={ input.username == "" || input.email == "" || input.password == "" || input.confirm_password == "" || !_.isEqual(input.password, input.confirm_password) || !validateCaptcha(input.captcha, false)}
                            onClick={evt=>{ submitForm(evt) }}>สมัครสมาชิก</Button>    
                    </form>
                </div>
            </div> );
}

export default RegisterPage