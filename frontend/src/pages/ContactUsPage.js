import React, { useState,  useEffect } from "react";
import { useTranslation } from "react-i18next";
import _ from "lodash"
import {
    TextField,
    Button,
    Stack
} from '@mui/material';
import { loadCaptchaEnginge, LoadCanvasTemplate , validateCaptcha} from "react-simple-captcha";
import AttackFileField from "../components/AttackFileField";

const initialValue = { title: "", description: "", files: [], captcha: "", }
const ContactUsPage = (props) => {
    let { t } = useTranslation();
    let [input, setInput] = useState(initialValue)

    let { onMutationContactUs } = props    
    useEffect( () => {
        loadCaptchaEnginge(8);
    },[]);

    const submitForm = async(event) => {
        validateCaptcha(input.captcha)

        let newInput = _.omit(input, ['captcha'])
        onMutationContactUs({ variables: { input: newInput } });

        setInput(initialValue)
    }

    return (<div className="content-bottom">
                <div className="content-page border">   
                <div className="row">
                    <Stack
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
                            multiple={false}
                            required={true}
                            onChange={(values) => {
                                setInput({...input, files: values})
                            }}
                            onSnackbar={(data) => {
                                // setSnackbar(data);
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
                    </Stack>
                </div>
            </div>
            </div>)
}

export default ContactUsPage