import React, { useState,  useEffect, useMemo } from "react";
import { useNavigate, useLocation, createSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import _ from "lodash"
import { useQuery } from "@apollo/client";
import InfiniteScroll from "react-infinite-scroll-component";
import {
    TextField,
    Button,
    Stack
} from '@mui/material';
import AttackFileField from "./AttackFileField";

import { getHeaders } from "./util"
import { queryBookmarks, mutationNotification } from "./gqlQuery"

const initialValue = { title: "", description: "", files: [] }

const ContactUsPage = (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    let [snackbar, setSnackbar] = useState({open:false, message:""});
    
    let [input, setInput] = useState(initialValue)

    let { onMutationContactUs } = props

    useEffect(()=>{
        console.log("input :", input)
    }, [input])

    const submitForm = async(event) => {
        onMutationContactUs({ variables: { input } });
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
                            <Button 
                                type="submit" 
                                variant="contained" 
                                color="primary"
                                onClick={(evt)=>submitForm(evt)}>{t("send")}</Button>
                        </Stack>)
            }, [input]);
}

export default ContactUsPage