import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import deepdash from "deepdash";
import { useMutation } from "@apollo/client";
import mongoose from "mongoose";

import {
  Button,
  Stack
} from "@mui/material"

import { getHeaders } from "./util"
import { mutationMe, queryMe } from "./gqlQuery"
import BankInputField from "./fields/BankInputField"

deepdash(_);

const BankPage = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const initValues = {_id: "", bankNumber: "", bankId: ""}

  const { user } = props

  let [input, setInput]       = useState([]);

  let { mode, id } = location?.state

  console.log("mode, id :", mode, id, user )

  const [onMutationMe, resultMutationMe] = useMutation(mutationMe, {
    context: { headers: getHeaders(location) },
    update: (cache, {data: {me}}) => {
      if(me.status){
        const queryMeValue = cache.readQuery({ query: queryMe });
        if(!_.isNull(queryMeValue)){
          cache.writeQuery({
            query: queryMe,
            data: { me: {...queryMeValue.me, data: me.data} }
          });
        }
      }
    },
    onCompleted({ data }) {
      navigate(-1)
    },
    onError(error){
      console.log("onError :", error)
    }
  });

  useEffect(()=>{
    switch(mode){
      case "new":{
        setInput([initValues])
        break;
      }

      case "edit":{
        let bank = _.find(user?.banks, (b)=> _.isEqual( b._id, id))
        if(!_.isEmpty(bank)) {
          setInput([bank])
        }
      }
    }
  }, [mode])

  const submitForm = async(event) => {
    switch(mode){
      case "new":{
        let newInput = {...user, banks:[...user.banks, input[0]]}

        delete newInput?._id;
        delete newInput?.createdAt;
        delete newInput?.updatedAt;
        delete newInput?.__v;
        delete newInput?.roles;

        onMutationMe({ variables: { input: newInput } });
        break;
      }
      case "edit":{
        let banks = _.map(user.banks, (m)=>_.isEqual(m._id, input[0]?._id) ? input[0] : m)
        let newInput = {...user, banks}

        delete newInput?._id;
        delete newInput?.createdAt;
        delete newInput?.updatedAt;
        delete newInput?.__v;
        delete newInput?.roles;

        onMutationMe({ variables: { input: newInput } });
        break;
      }
    }
  }

  const isDisabled = () =>{
    return _.isEmpty(_.filter(input, (b)=>b.bankId == "" || b.bankNumber == "")) ? false : true;
  }
                    
  return  <Stack
            direction="column"
            justifyContent="center"
            alignItems="flex-start">
            {
              _.isEqual(mode, "new") && !_.isEmpty(input)
              ? <BankInputField
                label={t("search_by_id_bank")}
                multiple={false}
                values={input}
                onChange={(val) => {
                  let newVal = _.map(val, (v)=>v?._id ? v : {...v, _id:new mongoose.Types.ObjectId()} )
                  setInput(newVal)
                }}/>
              : _.isEqual(mode, "edit") && !_.isEmpty(input)
                ? <BankInputField
                  label={t("search_by_id_bank")}
                  multiple={false}
                  values={input}
                  onChange={(val) => {
                    let newVal = _.map(val, (v)=>v?._id ? v : {...v, _id:new mongoose.Types.ObjectId()} )
                    setInput(newVal)
                  }}/>
                : <div />
            }
            
            <Button 
              variant="contained" 
              color="primary"  
              size="small"
              disabled={isDisabled()}
              onClick={(evt)=>submitForm()}>{t("save")}</Button>
          </Stack>
}

const mapStateToProps = (state, ownProps) => {
  return {}
}
const mapDispatchToProps = { }
export default connect( mapStateToProps, mapDispatchToProps )(BankPage);