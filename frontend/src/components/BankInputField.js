import React, { useState, useEffect } from "react";
// import Typography from "@mui/material/Typography";
// import Link from "@mui/material/Link";
// import Box from "@mui/material/Box";
// import TextField from "@mui/material/TextField";
// import Button from "@mui/material/Button";
// import { styled } from "@mui/material/styles";
// import Autocomplete from "@mui/material/Autocomplete";
import AddBoxIcon from '@mui/icons-material/AddBox';
// import IconButton from "@mui/material/IconButton";
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { useQuery } from "@apollo/client";
// import LinearProgress from '@mui/material/LinearProgress';
import { useLocation } from "react-router-dom";

import {
  Stack,
  LinearProgress,
  IconButton,
  Autocomplete,
  TextField,
  Typography
} from '@mui/material'

import { useTranslation } from "react-i18next";
import _ from "lodash"

import { getHeaders } from "../util"
import { queryBanks } from "../gqlQuery"

const BankInputField = (props) => {
  const location = useLocation();
  const { t }    = useTranslation();
  const { label, values, onChange, multiple = true } = props
  const [inputList, setInputList] = useState(values);

  let [banks, setBanks] = useState([])

  const { loading: loadingBanks, 
          data: dataBanks, 
          error: errorBanks, 
          networkStatus } = useQuery(queryBanks, 
                                      { 
                                        context: { headers: getHeaders(location) }, 
                                        fetchPolicy: 'network-only', // Used for first execution
                                        nextFetchPolicy: 'cache-first', // Used for subsequent executions
                                        notifyOnNetworkStatusChange: true
                                      }
                                    );

  useEffect(() => {
    if(!loadingBanks){
      if(!_.isEmpty(dataBanks?.banks)){
        let { status, data } = dataBanks?.banks
        if(status){
          setBanks(data)
        }
      }
    }
  }, [dataBanks, loadingBanks])

  const onInputChange = (e, index) => {
    const { name, value } = e.target;
    const list = [...inputList];
    list[index][name] = value;
    setInputList(list);

    onChange(list);
  };

  const handleRemoveClick = (index) => {
    const list = [...inputList];
    list.splice(index, 1);
    setInputList(list);

    onChange(list);
  };

  const handleAddClick = () => {
    let newList =  [...inputList, { bankNumber: "", bankId: "" }]
    setInputList(newList);

    onChange(newList);
  };

  const onBankIdChange = (e, bank, index) => {
    // console.log("onBankIdChange ", bank)
    let newList = [...inputList];
    if(bank !== null){
      newList[index].bankId = bank._id;
    }else{
      newList[index].bankId = "";
    }
    setInputList(newList);

    onChange(newList);
  };

  return  <Stack direction="column" spacing={2} alignItems="flex-start">
            { 
             multiple == false
             ?  <div />
             :  <Stack alignItems="flex-start" >
                  <Typography variant="overline" display="block" gutterBottom> {label} </Typography>
                  <IconButton
                    color="primary"
                    aria-label="upload picture"
                    component="span"
                    onClick={handleAddClick}>
                    <AddBoxIcon />
                  </IconButton>
                </Stack>
            }
            {_.map(inputList, (x, i) => {
              return (
                <Stack spacing={2} key={i} >
                  <TextField
                    id="input-bank-account-name"
                    name="bankNumber"
                    label={t("bank_account_number")}
                    variant="filled"
                    value={x.bankNumber}
                    required
                    onChange={(e) => onInputChange(e, i)} />
                  { 
                    loadingBanks
                    ? <LinearProgress sx={{width:"100px"}} /> 
                    : <Autocomplete
                        disablePortal
                        id="input-bank-id"
                        options={banks}
                        getOptionLabel={(option) => option.name}
                        defaultValue={ _.find(banks, (v)=>x.bankId === v._id) }
                        renderInput={(params) => <TextField {...params} label={t("bank_account_name")} required={_.isEmpty(x.bankId) ? true : false} />}
                        onChange={(event, values) => onBankIdChange(event, values, i)}
                      />
                  }
                  {
                    multiple == false
                    ?  <div />
                    : <Stack alignItems="flex-start" >
                        <IconButton
                          color="primary"
                          aria-label="upload picture"
                          component="span"
                          onClick={() => handleRemoveClick(i)}>
                          <RemoveCircleIcon />
                        </IconButton>
                      </Stack>
                  }
                </Stack>
              );
            })}
          </Stack>
};

export default BankInputField;
