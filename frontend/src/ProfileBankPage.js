import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import { ToastContainer, toast } from 'react-toastify';
import CircularProgress from '@mui/material/CircularProgress';
import 'react-toastify/dist/ReactToastify.css';
import _ from "lodash";
import deepdash from "deepdash";
deepdash(_);

import { useQuery, useMutation } from "@apollo/client";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";

import { getHeaders } from "./util"
import { mutationMe, queryMe } from "./gqlQuery"

import { login } from "./redux/actions/auth"
import BankInputField from "./BankInputField"

let initValues = { banks: [] }

const ProfileBankPage = (props) => {
  let history = useHistory();
  let location = useLocation();
  let { t } = useTranslation();

  let { user } = props

  let [input, setInput]       = useState( _.isEmpty(user.banks) ? {banks: [{ bankNumber: "", bankId: "" }]} : {banks: user.banks});
  let [error, setError]       = useState(initValues);

  const [onMutationMe, resultMutationMe] = useMutation(mutationMe, {
    context: { headers: getHeaders(location) },
    update: (cache, {data: {me}}) => {
      const queryMeValue = cache.readQuery({ query: queryMe });
      // let newData = {...queryMeValue.me.data, me.data};

      if(!_.isNull(queryMeValue)){
        cache.writeQuery({
          query: queryMe,
          data: { me: {...queryMeValue.me, data: me.data} }
        });
      }
     
    },
    onCompleted({ data }) {
      history.goBack()
    },
    onError({error}){
      console.log("onError :", error)
    }
  });
  console.log("resultMutationMe :", resultMutationMe)

  const submitForm = async(event) => {
    event.preventDefault();
    let newInput =  {...user, banks: input.banks}

    newInput = _.omitDeep(newInput, ['_id', '__v', 'createdAt', 'updatedAt', 'balanceBook'])
    console.log("submitForm :", newInput)
    onMutationMe({ variables: { input: newInput } });
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
        case "title": {
          if (!value) {
            stateObj[name] = "Please enter title.";
          }
          break;
        }

        case "price": {
          if (!value) {
            stateObj[name] = "Please enter price.";
          }
          break;
        }

        case "priceUnit": {
          if (!value) {
            stateObj[name] = "Please enter price unit.";
          } 

          break;
        }

        default:
          break;
      }

      return stateObj;
    });
  };
                    
  return (<LocalizationProvider dateAdapter={AdapterDateFns} >
            <Box component="form" sx={{ "& .MuiTextField-root": { m: 1, width: "50ch" } }} onSubmit={submitForm}>
              <div style={{flex:1}}>
                <BankInputField
                  label={t("search_by_id_bank")}
                  values={input.banks}
                  onChange={(values) => {
                    console.log("BankInputField : ", values)
                    setInput({...input, banks: values})
                  }}
                />
              </div>
              <Button type="submit" variant="contained" color="primary">{t("save")} </Button>
            </Box>
          </LocalizationProvider>);
}

const mapStateToProps = (state, ownProps) => {
  return {user: state.auth.user}
}
const mapDispatchToProps = { login }

export default connect( mapStateToProps, mapDispatchToProps )(ProfileBankPage);