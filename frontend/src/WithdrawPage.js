import { useMutation, useQuery } from "@apollo/client";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { connect } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import { 
  Stack,
  Box,
  Button,
  LinearProgress,
  Autocomplete,
  TextField
} from "@mui/material";

import { mutationWithdraw, queryBanks, queryWithdrawById, queryWithdraws } from "./gqlQuery";
import { logout } from "./redux/actions/auth";
import { getHeaders, checkRole } from "./util";
import  * as Constants from "./constants";
import BankComp from "./components/BankComp"

let initValues = { bank: null,  balance: "", status: "" }

const WithdrawPage = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  let [input, setInput]       = useState(initValues);
  let [error, setError]       = useState(initValues);

  const [banks, setBanks] = useState([]);

  let { user } = props
  let { mode, id } = location.state

  console.log("WithdrawPage :", mode, id, user)

  const { loading: loadingBanks, 
          data: dataBanks, 
          error: errorBanks} = useQuery(queryBanks, { context: { headers: getHeaders(location) },
                                                      notifyOnNetworkStatusChange: true, 
                                                      fetchPolicy: 'cache-first', // Used for first execution
                                                      nextFetchPolicy:  'network-only', // Used for subsequent executions
                                                    });

  let { loading: loadingWithdrawById, 
        data: dataWithdrawById, 
        error: errorWithdrawById,
        refetch: refetchWithdrawById } =  useQuery(queryWithdrawById, {
                                                  context: { headers: getHeaders(location) },
                                                  variables: {id},
                                                  fetchPolicy: 'network-only', // Used for first execution
                                                  nextFetchPolicy: 'cache-first', // Used for subsequent executions
                                                  notifyOnNetworkStatusChange: true,
                                                })

  if(!_.isEmpty(errorWithdrawById)){
    _.map(errorWithdrawById?.graphQLErrors, (e)=>{

      console.log("error :", e)
      // switch(e?.extensions?.code){
      //   case FORCE_LOGOUT:{
      //     logout()
      //     break;
      //   }
      // }
    })
  }

  const [onMutationWithdraw, resultMutationWithdraw] = useMutation(mutationWithdraw, {
    context: { headers: getHeaders(location) },
    update: (cache, {data: {withdraw}}) => {
      let { data, mode, status } = withdraw

      if(status){
        
        switch(mode){
          case "new":{
            const queryWithdrawsValue = cache.readQuery({ query: queryWithdraws });
            if(!_.isEmpty(queryWithdrawsValue)){
              let newData = [...queryWithdrawsValue.withdraws.data, withdraw.data];

              cache.writeQuery({
                query: queryWithdraws,
                data: { withdraws: {...queryWithdrawsValue.withdraws, data: newData} }
              });
            }
            
            ////////// update cache queryWithdrawById ///////////
            let queryWithdrawByIdValue = cache.readQuery({ query: queryWithdrawById, variables: {id: data._id}});
            if(!_.isEmpty(queryWithdrawByIdValue)){
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
    onCompleted(data) {
      switch(checkRole(user)){
        case Constants.AMDINISTRATOR:{
          navigate("/withdraws")
          break;
        }
  
        case Constants.AUTHENTICATED:{
          navigate("/")
          break;
        }
      }
    },
    onError(error){
      console.log("onError :", error)
    }
  });

  useEffect(()=>{
    if( !loadingWithdrawById && mode == "edit"){
      if(!_.isEmpty(dataWithdrawById?.withdrawById)){
        let { status, data } = dataWithdrawById.withdrawById
        if(status){
          setInput({
            balance: data.balance, 
            bank: data?.bank, 
            status: data.status
          })
        }
      }
    }
  }, [dataWithdrawById, loadingWithdrawById])

  useEffect(()=>{
    if(!loadingBanks){
      if(!_.isEmpty(dataBanks?.banks)){
        let { status, data } = dataBanks.banks
        if(status) setBanks(data)
      }
    }
  }, [dataBanks, loadingBanks])

  useEffect(()=>{
    if(mode == "edit" && id){
      refetchWithdrawById({id});
    }
  }, [id])

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


   {/* <label>เลือกบัญชี</label>
                      <select 
                        name="bank" 
                        id="bank" 
                        value={ input.bank }
                        onChange={ onInputChange }
                        onBlur={ validateInput }>
                        <option value={""}>ไม่เลือก</option>
                        { _.map(user.banks, (value)=>{
                          let f = _.find(banks, (bank)=>_.isEqual(bank._id, value.bankId) )
                          return <option key={value?._id} value={value?._id}>{value?.bankNumber} - {f?.name}</option>
                        } )}
                      </select> 
                      <p className="text-red-500"> {_.isEmpty(error.bank) ? "" : error.bank} </p>   */}
  return  <Stack
            direction="column"
            justifyContent="center"
            alignItems="flex-start"
            spacing={2}>
              {
                loadingBanks
                ? <LinearProgress /> 
                : _.isEqual(mode, 'new')
                  ? <Box> 
                      <Autocomplete
                        label={"เลือกบัญชี *"}
                        disablePortal
                        id="bank"
                        sx={{ width: 300 }}
                        options={ user.banks }
                        getOptionLabel={(option)=>`${option.bankNumber} (${option.name})`}
                        // defaultValue={ _.find(banks, (v)=>input?.bank?._id === v._id) }
                        renderInput={(params) =>{
                          return  <TextField {...params} label={t("bank_account_name")}  /*required={_.isEmpty(input?.bank?._id) ? true : false} */ />
                        } }
                        onChange={(event, val) => setInput({...input, bank: val}) }
                      />
                    </Box>
                  : _.isEqual(mode, 'edit')
                    ? <div>เลือกเลขที่บัญชี : {input?.bank?.bankNumber} - {(_.find(banks, (bank)=>_.isEqual(bank._id, input?.bank?.bankId) ))?.name}</div>
                    : ""
              }
              {
                _.isEqual(mode, 'new')
                ? <Box> 
                    <TextField 
                    type="number" 
                    name="balance"
                    label={"ยอดเงิน *"}
                    value={ input.balance }
                    sx={{ width: 300 }}
                    // onChange={ onInputChange }
                    // onBlur={ validateInput } 
                    /> 
                  </Box>
                
                  /*<div>
                    <label>ยอดเงิน * :</label>
                    <input 
                      type="number" 
                      name="balance"
                      value={ input.balance }
                      onChange={ onInputChange }
                      onBlur={ validateInput } />
                    <p className="text-red-500"> {_.isEmpty(error.balance) ? "" : error.balance} </p>
                  </div>*/

                :  _.isEqual(mode, 'edit')
                   ? <div>ยอดเงิน : {input.balance}</div>
                   : ""
              }
              {
                   _.isEqual(mode, 'edit') &&  _.isEqual( checkRole(user),  Constants.AMDINISTRATOR )
                  &&  <div>
                        <label>{t("status")} </label>
                        <select 
                          name="status" 
                          id="status" 
                          value={input.status}
                          onChange={ onInputChange }
                          onBlur={ validateInput }>
                          <option value={""}>ไม่เลือก</option>
                          { _.map(['wait','approved', 'reject'], (name, id)=><option key={id} value={name}>{name}</option>) }
                        </select> 
                        <p className="text-red-500"> {_.isEmpty(error.status) ? "" : error.status} </p>  
                      </div>   
                }
            <Box>
              <div>ยอดที่สามารถถอดได้ { user.balance - input.balance - user.balanceBook } บาท</div>
            </Box>
            <Button 
              variant="contained" 
              color="primary"
              onClick={(evt)=>{ submitForm(evt) }}>{t("withdraw")}</Button>
          </Stack>
}

const mapStateToProps = (state, ownProps) => {
    return { }
}
const mapDispatchToProps = { logout }
export default connect( mapStateToProps, mapDispatchToProps )(WithdrawPage);