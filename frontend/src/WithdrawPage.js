import React, { useState, useEffect, useMemo, useRef, useCallback  } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import { ToastContainer, toast } from 'react-toastify';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
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

let initValues = { bank: null,  balance: "", status: "wait" }

const WithdrawPage = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  let [snackbar, setSnackbar] = useState({open:false, message:""});
  let [input, setInput]       = useState(initValues);
  let [error, setError]       = useState(initValues);

  const [inputList, setInputList] = useState([]);

  const [banks, setBanks] = useState([]);

  let { user, logout } = props
  let { mode, id } = location.state

  const { loading: loadingBanks, 
          data: dataBanks, 
          error: errorBanks} = useQuery(queryBanks, { notifyOnNetworkStatusChange: true, });

  useEffect(()=>{
    if (dataBanks) {
      let { status, data } = dataBanks.banks
      if(status){
        setBanks(data)
      }
    }
  }, [dataBanks, loadingBanks])

  const [onMutationWithdraw, resultMutationWithdraw] = useMutation(mutationWithdraw, {
    context: { headers: getHeaders(location) },
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
      // history.goBack();
      navigate(-1)
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
            stateObj[name] = "Please enter balance.";
          }else if(value > user.balance - user.balanceBook){
            // console.log("balance :", value > user.balance - user.balanceBook, value , user.balance - user.balanceBook, user.balanceBook, user.balance )
          
            stateObj[name] = "Please enter cannot balance.";
          }
          break;
        }
        default:
          break;
      }
      return stateObj;
    });
  };
 
  return  <LocalizationProvider dateAdapter={AdapterDateFns} >
            <Box component="form" sx={{ "& .MuiTextField-root": { m: 1, width: "50ch" } }}  onSubmit={submitForm}>
              <div>
                {
                  loadingBanks
                  ? <LinearProgress /> 
                  : <Autocomplete
                      disablePortal
                      id="bank-id"
                      options={user.banks}
                      getOptionLabel={(option) => {
                        console.log("getOptionLabel :", option)
                        let find = _.find(banks, (item)=>item._id.toString() == option.bankId.toString())   
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
              <div>ยอดที่สามารถถอดได้ { user.balance - input.balance - user.balanceBook } บาท</div>
              <Button type="submit" variant="contained" color="primary">
                  {t("withdraw")}
              </Button>
            </Box>
          </LocalizationProvider>
}

const mapStateToProps = (state, ownProps) => {
    return { user:state.auth.user }
};

const mapDispatchToProps = { logout }

export default connect( mapStateToProps, mapDispatchToProps )(WithdrawPage);