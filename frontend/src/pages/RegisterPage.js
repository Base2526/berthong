import React , {useState, useEffect} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation, useApolloClient } from "@apollo/client";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import {
    Stack,
    DialogTitle,
    DialogContentText,
    DialogContent,
    DialogActions,
    Dialog,
    Box,
    TextField,
    Avatar,
    LinearProgress,
    Button
  } from '@mui/material'

import { loadCaptchaEnginge, LoadCanvasTemplate , validateCaptcha} from "react-simple-captcha";
import { checkRole, getHeaders, handlerErrorApollo, showToast} from "../util";
import { mutationRegister } from "../apollo/gqlQuery"

let initValues = { username: "", email: "",  password: "", confirm_password: "", captcha: "" }
const RegisterPage = (props) => {
    let { t } = useTranslation();
    let navigate = useNavigate();
    const location = useLocation();

    let [input, setInput]   = useState(initValues);
    let [error, setError]   = useState({username: "", password_not_match: ""});


    if(!_.isEmpty(props?.user)){
        navigate("/me")
    }

    const [onRegister, resultRegister] = useMutation(mutationRegister, { 
        context: { headers: getHeaders(location) },
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

    const validateUsername = (value) =>{
        const regex = /^[a-z0-9]+$/;
        if (!regex.test(value)) {
            return false
        }

        return true
    }

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
            case "username":{
                if (!validateUsername(value)) {
                    stateObj["username"] = `a-z A-Z 1-9 ไม่สามารถมีช่องว่างได้`;
                }
                break;
            }
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

    return (<div className="content-bottom">
            <div className="content-page border">
                <div className="col-lg-6 col-12">
                <div className="row m-2">
                <div className="page-userlog pl-2 pr-2">
                <div className="Mui-usercontainerss">
                    <form >
                    <Stack
                          direction="column"
                          justifyContent="center"
                          alignItems="flex-start"
                          spacing={2}>
                        <Box> 
                                <TextField 
                                    name="username"
                                    label={"ชื่อผู้ใช้งาน *"}
                                    sx={{ width: 200 }}
                                    value={input.username} 
                                    onChange={onInputChange}
                                    onBlur={ validateInput } /> 
                                    <p className="text-red-500"> {_.isEmpty(error.username) ? "" : error.username} </p>
                        </Box>
                        {/* ขอเพิ่มเบอร์โทรศัพท์  */}
                        {/* <Box> 
                                <TextField 
                                    name="เบอร์โทร"
                                    label={"เบอร์โทร *"}
                                    sx={{ width: 200 }}
                                    value={input.phone} 
                                    onChange={onInputChange}
                                    onBlur={ validateInput } /> 
                        </Box>    */}
                        <Box> 
                                <TextField 
                                    name="email"
                                    label={"อีเมลล์ *"}
                                    sx={{ width: 200 }}
                                    value={input.email} 
                                    onChange={onInputChange}
                                    onBlur={ validateInput } /> 
                        </Box>   
                        <Box> 
                                <TextField 
                                    type="password"
                                    name="password"
                                    label={"รหัสผ่าน *"}
                                    sx={{ width: 200 }}
                                    value={input.password} 
                                    onChange={onInputChange}
                                    onBlur={ validateInput } /> 
                        </Box>
                        <Box> 
                                <TextField 
                                    type="password"
                                    name="confirm_password"
                                    label={"ยืนยันรหัสผ่าน *"}
                                    sx={{ width: 200 }}
                                    value={input.confirm_password} 
                                    onChange={onInputChange}
                                    onBlur={ validateInput } /> 
                                    <p className="text-red-500"> {_.isEmpty(error.password_not_match) ? "" : error.password_not_match} </p>
                        </Box>
                        <Box>
                            <LoadCanvasTemplate reloadText="Reload Captcha" reloadColor="red" />
                        </Box>
                        <Box>
                            <div className="">
                                    {/* <input 
                                        type="text"  
                                        id="captcha" 
                                        name="captcha" 
                                        placeholder="Enter the Captcha"
                                        onChange={(evt)=> setInput({...input, captcha: evt.target.value}) }
                                        autoComplete="off"/> */}
                                    <TextField 
                                    type="text"  
                                    id="captcha" 
                                    name="captcha" 
                                    label={"Enter the Captcha *"}
                                    sx={{ width: 200 }}
                                    onChange={(evt)=> setInput({...input, captcha: evt.target.value}) }
                                    autoComplete="off"/> 
                            </div>
                        </Box>
                        <Box>
                        <Button 
                            variant="contained" 
                            color="warning" 
                            disabled={ !validateUsername(input.username) ||  input.username == "" || input.email == "" || input.password == "" || input.confirm_password == "" || !_.isEqual(input.password, input.confirm_password) || !validateCaptcha(input.captcha, false)}
                            onClick={evt=>{ submitForm(evt) }}>สมัครสมาชิก</Button>    
                        </Box>
                    </Stack>
                        {/* <div className="d-flex form-input">
                            <label>{t("username")}</label>
                            <div className="position-relative wrapper-form">
                                <input type="text" name="username" className="input-bl-form" value={input.username} onChange={onInputChange} />
                                <AccountCircle />
                            </div>         
                        </div>
                        <div className="d-flex form-input">
                            <label>{t("email")}</label>
                            <div className="position-relative wrapper-form">
                                <input type="email" name="email" className="input-bl-form" value={input.email} onChange={onInputChange} />
                                <EmailSharpIcon />
                            </div>
                        </div>
                        <div className="d-flex form-input">
                            <label>{t("password")}</label>
                            <div className="position-relative wrapper-form">
                                <input type="password" name="password" className="input-bl-form" value={input.password} onChange={onInputChange} />
                                <LockIcon/>
                            </div>
                        </div>
                        <div className="d-flex form-input">
                            <label>{t("confirm_password")}</label>
                            <div className="position-relative wrapper-form">
                                <input type="password" name="confirm_password" className="input-bl-form" value={input.confirm_password} onChange={onInputChange} />
                                <LockIcon/>
                            </div>
                            <p className="text-red-500"> {_.isEmpty(error.password_not_match) ? "" : error.password_not_match} </p>
                        </div> */}
                    </form>
                </div>
                </div></div></div></div></div> );
}

export default RegisterPage