import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import deepdash from "deepdash";
import { useMutation } from "@apollo/client";

import {
  Button,
  Stack
} from "@mui/material"

import { getHeaders } from "./util"
import { mutationMe, queryMe } from "./gqlQuery"
import { login } from "./redux/actions/auth"
import BankInputField from "./components/BankInputField"

deepdash(_);

let initValues = { banks: [] }

const MeBankPage = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { user } = props

  let [input, setInput]       = useState( _.isEmpty(user.banks) ? {banks: [{ bankNumber: "", bankId: "" }]} : {banks: user.banks});
  let [error, setError]       = useState(initValues);

  const [onMutationMe, resultMutationMe] = useMutation(mutationMe, {
    context: { headers: getHeaders(location) },
    update: (cache, {data: {me}}) => {
      const queryMeValue = cache.readQuery({ query: queryMe });
      // let newData = {...queryMeValue.me.data, me.data};

      // if(!_.isNull(queryMeValue)){
      //   cache.writeQuery({
      //     query: queryMe,
      //     data: { me: {...queryMeValue.me, data: me.data} }
      //   });
      // }
    },
    onCompleted({ data }) {
      // history.goBack()
      // navigate(-1)
      console.log("")
    },
    onError(error){
      console.log("onError :", error)
    }
  });

  const submitForm = async(event) => {

    console.log("submitForm :", input)
    // event.preventDefault();
    // let newInput =  {...user, banks: input.banks}

    // newInput = _.omitDeep(newInput, ['_id', '__v', 'createdAt', 'updatedAt', 'balanceBook'])
    // console.log("submitForm :", newInput)
    // onMutationMe({ variables: { input: newInput } });
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
                    
  return  <Stack
            direction="column"
            justifyContent="center"
            alignItems="flex-start">
            <BankInputField
              label={t("search_by_id_bank")}
              multiple={false}
              values={input.banks}
              onChange={(values) => {
                setInput({...input, banks: values})
              }}/>
            <Button 
              variant="contained" 
              color="primary"  
              size="small"
              onClick={(evt)=>submitForm()}>{t("save")}</Button>
          </Stack>
}

const mapStateToProps = (state, ownProps) => {
  return {}
}
const mapDispatchToProps = { login }

export default connect( mapStateToProps, mapDispatchToProps )(MeBankPage);