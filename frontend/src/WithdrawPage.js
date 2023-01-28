import React, { useState, useEffect, useMemo, useRef, useCallback  } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import { ToastContainer, toast } from 'react-toastify';
import CircularProgress from '@mui/material/CircularProgress';
import 'react-toastify/dist/ReactToastify.css';
import _ from "lodash"
import { useQuery, useMutation, useApolloClient } from "@apollo/client";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Autocomplete from "@mui/material/Autocomplete";

import { getHeaders, checkRole } from "./util"
import { queryWithdrawById, mutationWithdraw, queryBanks, queryWithdraws} from "./gqlQuery"
import { logout } from "./redux/actions/auth"
import { AMDINISTRATOR } from "./constants"

import AttackFileField from "./AttackFileField";

let initValues = { bank: null,  balance: "", status: "wait" }

/*
bankId : "630a0c3ee0359b0140ea2ce4"
bankNumber : "88822212"
_id : "63d3b6155e0c230029c57274"
*/

const WithdrawPage = (props) => {
  let history = useHistory();
  let location = useLocation();
  let { t } = useTranslation();
  let [snackbar, setSnackbar] = useState({open:false, message:""});
  let [input, setInput]       = useState(initValues);
  let [error, setError]       = useState(initValues);

  const [inputList, setInputList] = useState([]);

  let { user, logout } = props
  let { mode, id } = location.state

  console.log("location.state : ", location.state)

  let valueBanks = useQuery(queryBanks, { notifyOnNetworkStatusChange: true, });

  console.log("valueBanks :", valueBanks)

  let editValues = null;

  // console.log("user :", user)

  const [onMutationWithdraw, resultMutationWithdraw] = useMutation(mutationWithdraw, {
    context: { headers: getHeaders() },
    update: (cache, {data: {withdraw}}) => {
      let { data, mode, status } = withdraw

      if(status){
        
        switch(mode){
          case "new":{
            const queryWithdrawsValue = cache.readQuery({ query: queryWithdraws });
            let newData = [...queryWithdrawsValue.withdraws.data, withdraw.data];

            cache.writeQuery({
              query: queryWithdraws,
              data: { withdraws: {...queryWithdrawsValue.withdraws, data: newData} }
            });


            ////////// update cache queryWithdrawById ///////////
            let queryWithdrawByIdValue = cache.readQuery({ query: queryWithdrawById, variables: {id: data._id}});
            if(queryWithdrawByIdValue){
              cache.writeQuery({
                query: queryWithdrawById,
                data: { withdrawById: {...queryWithdrawByIdValue.withdrawById, data} },
                variables: {id: data._id}
              });
            }
            ////////// update cache queryWithdrawById ///////////   
            break;
          }

          case "edit":{
            const queryWithdrawsValue = cache.readQuery({ query: queryWithdraws });
            let newData = _.map(queryWithdrawsValue.withdraws.data, (item)=> item._id == withdraw.data._id ? withdraw.data : item ) 

            if(withdraw.data.status == "approved" || withdraw.data.status == "reject"){
              newData = _.filter(queryWithdrawsValue.withdraws.data, (item)=> item._id != withdraw.data._id ) 
            }
            
            cache.writeQuery({
              query: queryWithdraws,
              data: { withdraws: {...queryWithdrawsValue.withdraws, data: newData} }
            });

            ////////// update cache queryWithdrawById ///////////
            let queryWithdrawByIdValue = cache.readQuery({ query: queryWithdrawById, variables: {id: data._id}});
            if(queryWithdrawByIdValue){
              cache.writeQuery({
                query: queryWithdrawById,
                data: { withdrawById: {...queryWithdrawByIdValue.withdrawById, data} },
                variables: {id: data._id}
              });
            }
            ////////// update cache queryWithdrawById ///////////            
            break;
          }
        }
        
      }
    },
    onCompleted({ data }) {
      history.goBack();
    },
    onError({error}){
      console.log("onError :")
    }
  });
  // console.log("resultMutationWithdraw :", resultMutationWithdraw)

  /*
  ฝาก
  - จำนวนเงิน
  - วันที่โอนเงิน ชม/นาที
  - สลิปการโอน
  */

  /*
  ถอน 
  - ชือบัญชี
  - ยอดเงิน
  */
  const submitForm = async(event) => {
    event.preventDefault();

    let newInput =  {
      mode: mode.toUpperCase(),
      bank: input.bank,
      balance: parseInt(input.balance),
      status: input.status,
    }

    if(mode == "edit"){
      newInput = {...newInput, _id: editValues.data.withdrawById.data._id}
    }
    onMutationWithdraw({ variables: { input: newInput } });
  }

  const onBankIdChange = (e, bank) => {
    setInput({...input, bank})
  };

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
            stateObj[name] = "Please enter Balance.";
          }
          break;
        }
        default:
          break;
      }
      return stateObj;
    });
  };

  const adminView = () =>{
     switch(checkRole(user)){
            case AMDINISTRATOR:{
              return  <Autocomplete
                        disablePortal
                        id="bank-id"
                        options={['wait','approved', 'reject']}
                        getOptionLabel={(option) => {
                          return option
                        }}
                        defaultValue={ input.status }
                        renderInput={(params) => 
                        {
                          return <TextField {...params} label={t("status")} required={ false } />
                        }}
                        onChange={(event, status) =>{
                          setInput({...input, status})
                        }}/>
            }
          }
  }

  switch(mode){
    case "new":{
      return  <LocalizationProvider dateAdapter={AdapterDateFns} >
                <Box component="form" sx={{ "& .MuiTextField-root": { m: 1, width: "50ch" } }}  onSubmit={submitForm}>
                  <div>
                    {
                      valueBanks.loading
                      ? <CircularProgress /> 
                      : <Autocomplete
                          disablePortal
                          id="bank-id"
                          options={user.banks}
                          getOptionLabel={(option) => {
                            console.log("getOptionLabel :", option)
                            let find = _.find(valueBanks.data.banks.data, (item)=>item._id.toString() == option.bankId.toString())   
                            return option.bankNumber +" - "+find.name
                          }}
                          defaultValue={ input.bank }
                          renderInput={(params) => 
                          {
                            return <TextField {...params} label={t("bank_account_name")} required={ _.isEmpty(input.bank) ? true : false } />
                          }}
                          onChange={(event, values) => onBankIdChange(event, values)}/>
                    }
                    
                    <TextField
                      id="balance"
                      name="balance"
                      label={"ยอดเงิน"}
                      variant="filled"
                      type="number"
                      required
                      value={ _.isEmpty(input.balance) ? "" : input.balance}
                      onChange={onInputChange}
                      onBlur={validateInput}
                      helperText={ _.isEmpty(error.balance) ? "" : error.balance }
                      error={_.isEmpty(error.balance) ? false : true}/>
                  </div>
                  <Button type="submit" variant="contained" color="primary">
                      {t("withdraw")}
                  </Button>
                </Box>
              </LocalizationProvider>
    }

    case "edit":{
      editValues = useQuery(queryWithdrawById, {
                        context: { headers: getHeaders() },
                        variables: {id},
                        notifyOnNetworkStatusChange: true,
                      });

      

      if(_.isEqual(input, initValues)) {
        if(!_.isEmpty(editValues)){
          let {loading}  = editValues
          
          if(!loading){
            let {status, data} = editValues.data.withdrawById

            console.log("editValues.data.withdrawById :", status, data)
            if(status){

              console.log("data.bank :", data)
              setInput({
                bank: data.bank[0],  
                balance: data.balance,
                status: data.status
              })
            }
          }
        }
      }

      return  editValues != null && editValues.loading
                ? <div><CircularProgress /></div> 
                : <LocalizationProvider dateAdapter={AdapterDateFns} >
                    <Box component="form" sx={{ "& .MuiTextField-root": { m: 1, width: "50ch" } }}  onSubmit={submitForm}>
                      <div>
                        {
                          valueBanks.loading
                          ? <CircularProgress /> 
                          : <Autocomplete
                              disablePortal
                              id="bank-id"
                              options={user.banks}
                              getOptionLabel={(option) => {
                                let find = _.find(valueBanks.data.banks.data, (item)=>item._id.toString() == option.bankId?.toString())   
                                return option.bankNumber +" - "+find.name
                              }}
                              defaultValue={ input.bank }
                              renderInput={(params) => 
                              {
                                return <TextField {...params} label={t("bank_account_name")} required={ _.isEmpty(input.bank) ? true : false } />
                              }}
                              onChange={(event, values) => onBankIdChange(event, values)}/>
                        }
                        
                        <TextField
                          id="balance"
                          name="balance"
                          label={"ยอดเงิน"}
                          variant="filled"
                          type="number"
                          required
                          value={ input.balance}
                          onChange={onInputChange}
                          onBlur={validateInput}
                          helperText={ _.isEmpty(error.balance) ? "" : error.balance }
                          error={_.isEmpty(error.balance) ? false : true}/>

                          {adminView()}
                      </div>
                      <Button type="submit" variant="contained" color="primary">
                          {t("withdraw")}
                      </Button>
                    </Box>
                  </LocalizationProvider>
    }

    default:{
      break;
    }
  }
  return (<div style={{flex:1}}>ฟอร์ม แจ้งถอดเงิน</div>);
}

const mapStateToProps = (state, ownProps) => {
    return { user:state.auth.user }
};

const mapDispatchToProps = { logout }

export default connect( mapStateToProps, mapDispatchToProps )(WithdrawPage);