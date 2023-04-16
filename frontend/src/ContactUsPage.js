import React, { useState,  useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import _ from "lodash"
import {
    TextField,
    Button,
    Stack
} from '@mui/material';
import { loadCaptchaEnginge, LoadCanvasTemplate , validateCaptcha} from "react-simple-captcha";
import AttackFileField from "./AttackFileField";

const initialValue = { title: "", description: "", files: [], captcha: "", }
const ContactUsPage = (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    let [snackbar, setSnackbar] = useState({open:false, message:""});
    let [input, setInput] = useState(initialValue)

    let { onMutationContactUs } = props

    useEffect( () => {
        loadCaptchaEnginge(8);
    },[]);

    const submitForm = async(event) => {
        let newInput = _.omit(input, ['captcha'])
        onMutationContactUs({ variables: { input: newInput } });
    }

    return  useMemo(() => {
                return (<Stack
                            direction="column"
                            justifyContent="center"
                            alignItems="flex-start"
                            spacing={2}>
                            <TextField
                                id="outlined-basic"
                                label="ชื่อเรื่อง"
                                required={true}
                                onChange={(e) => {
                                    setInput({...input, title: e.target.value})
                                }}
                                />
                            <TextField
                                id="outlined-multiline-flexible"
                                label="รายละเอียด"
                                multiline
                                maxRows={4}
                                rows={6}
                                required={true}
                                onChange={(e) => {
                                    setInput({...input, description: e.target.value})
                                }}
                                />
                            <AttackFileField
                                label={t("attack_file")}
                                values={input.files}
                                multiple={true}
                                required={true}
                                onChange={(values) => {
                                    setInput({...input, files: values})
                                }}
                                onSnackbar={(data) => {
                                    setSnackbar(data);
                                }}/>

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
                                type="submit" 
                                variant="contained" 
                                color="primary"
                                disabled={ (_.isEmpty( input.title ) || _.isEmpty(input.description)) || !validateCaptcha(input.captcha, false) }
                                onClick={(evt)=>submitForm(evt)}>{t("send")}</Button>
                        </Stack>)
            }, [input]);
}

export default ContactUsPage