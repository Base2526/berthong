import React, { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Stack,
  Box,
  Button,
  LinearProgress,
  Autocomplete,
  TextField
} from "@mui/material";

import { queryBanks } from "./gqlQuery";
import { getHeaders } from "./util";

let initValues = { bank: null,  balance: "" }

const WithdrawPage = (props) => {
  const navigate                = useNavigate();
  const location                = useLocation();
  const { t }                   = useTranslation();
  const [input, setInput]       = useState(initValues);
  const [error, setError]       = useState(initValues);
  const [banks, setBanks]       = useState([]);

  const { user, onMutationWithdraw } = props

  const { loading: loadingBanks, 
          data: dataBanks, 
          error: errorBanks} = useQuery(queryBanks, { context: { headers: getHeaders(location) },
                                                      notifyOnNetworkStatusChange: true, 
                                                      fetchPolicy: 'cache-first', 
                                                      nextFetchPolicy:  'network-only', 
                                                    });

  useEffect(()=>{
    if(!loadingBanks){
      if(!_.isEmpty(dataBanks?.banks)){
        let { status, data } = dataBanks.banks
        if(status) setBanks(data)
      }
    }
  }, [dataBanks, loadingBanks])

  useEffect(()=>{
    console.log( "input :", input, initValues, _.isEqual(input, initValues) )
  }, [input])

  const submitForm = async(event) => {
    console.log("submitForm")
    /*
    event.preventDefault();
    switch(mode){
      case "new":{
        let newInput =  {
          mode: mode.toUpperCase(),
          bank: _.omit(_.find(user.banks, (b)=> _.isEqual(b?._id, input.bank)), ['bankName']),
          balance: parseInt(input.balance),
        }
        onMutationWithdraw({ variables: { input: newInput } });
        break
      }

      case "edit":{
        let newInput =  {...input, mode: mode.toUpperCase(), _id: id, status: input.status}
        onMutationWithdraw({ variables: { input: newInput } });
        break;
      }
    } 
    */   
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
        case "accountNumber": {
          if (!value) {
            stateObj[name] = "Please enter Account number.";
          }
          break;
        }
        case "balance": {
          if (!value) {
            stateObj[name] = "Please enter balance.";
          }else if(value > user.balance - user.balanceBook){
            stateObj[name] = "Please enter cannot balance.";
          }
          break;
        }
        default:
          break;
      }
      return stateObj;
    });
  }

  const isWithdraw = () =>{
    return user.balance - input.balance - user.balanceBook
  }

  return  <Stack
            direction="column"
            justifyContent="center"
            alignItems="flex-start"
            spacing={2}>
            {
              loadingBanks
              ? <LinearProgress /> 
              : <Box> 
                  <Autocomplete
                    label={"เลือกบัญชี *"}
                    disablePortal
                    id="bank"
                    sx={{ width: 300 }}
                    options={ user?.banks }
                    getOptionLabel={(option)=>`${option.bankNumber} (${option.name})`}
                    renderInput={(params) =><TextField {...params} label={t("bank_account_name")} /> }
                    onChange={(event, val) => setInput({...input, bank: val}) }/>
                </Box>
            }
            <Box> 
              <TextField 
                type="number" 
                name="balance"
                label={"ยอดเงิน *"}
                value={ input.balance }
                sx={{ width: 300 }}
                onChange={ onInputChange }
                onBlur={ validateInput } /> 
            </Box>
            <Box>
              <div>ยอดที่สามารถถอดได้ { isWithdraw() } บาท</div>
            </Box>
            <Button 
              variant="contained" 
              color="primary"
              disabled={ input.bank != null && input.balance != "" && isWithdraw() > 0 ? false : true }
              onClick={(evt)=>submitForm(evt)}>{t("withdraw")}</Button>
          </Stack>
}

export default WithdrawPage