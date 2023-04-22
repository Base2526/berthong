import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import deepdash from "deepdash";
// import mongoose from "mongoose";
import { Button, Stack } from "@mui/material"

import BankInputField from "./fields/BankInputField"
deepdash(_);

const BankPage = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const initValues = { bankNumber: "", bankId: "" }
  const { user } = props
  let [input, setInput]       = useState([initValues]);
  // let { mode, id } = location?.state

  let { onMutationMe_bank }  = props

  // useEffect(()=>{
  //   switch(mode){
  //     case "new":{
  //       setInput([initValues])
  //       break;
  //     }

  //     case "edit":{
  //       let bank = _.find(user?.banks, (b)=> _.isEqual( b._id, id))
  //       if(!_.isEmpty(bank)) {
  //         setInput([bank])
  //       }
  //     }
  //   }
  // }, [mode])

  const submitForm = async(event) => {
    onMutationMe_bank({ variables: { input: { mode: "new", data: input } } })

    // switch(mode){
    //   case "new":{
    //     let newInput = {...user, banks:[...user.banks, input[0]]}

    //     delete newInput?._id;
    //     delete newInput?.createdAt;
    //     delete newInput?.updatedAt;
    //     delete newInput?.__v;
    //     delete newInput?.roles;

    //     onMutationMe({ variables: { input: newInput } });
    //     break;
    //   }
    //   case "edit":{
    //     let banks = _.map(user.banks, (m)=>_.isEqual(m._id, input[0]?._id) ? input[0] : m)
    //     let newInput = {...user, banks}

    //     delete newInput?._id;
    //     delete newInput?.createdAt;
    //     delete newInput?.updatedAt;
    //     delete newInput?.__v;
    //     delete newInput?.roles;

    //     onMutationMe({ variables: { input: newInput } });
    //     break;
    //   }
    // }
  }                    

  return  <Stack
            direction="column"
            justifyContent="center"
            alignItems="flex-start">
            <BankInputField
              label={t("search_by_id_bank")}
              multiple={false}
              values={input}
              onChange={(value) => setInput(value) }/>
            <Button 
              variant="contained" 
              color="primary"  
              size="small"
              disabled={ _.isEmpty(_.filter(input, (b)=>b.bankId == "" || b.bankNumber == "")) ? false : true }
              onClick={(evt)=>submitForm()}>{t("save")}</Button>
          </Stack>
}

export default BankPage;