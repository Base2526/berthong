import { useMutation, useQuery } from "@apollo/client";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import LinearProgress from '@mui/material/LinearProgress';
import TextField from "@mui/material/TextField";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { connect } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import { mutationWithdraw, queryBanks, queryWithdrawById, queryWithdraws } from "./gqlQuery";
import { logout } from "./redux/actions/auth";
import { getHeaders, checkRole } from "./util";
import { AMDINISTRATOR, AUTHENTICATED} from "./constants";

let initValues = { bank: null,  balance: "", status: "" }

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

  console.log("user :", user)

  const { loading: loadingBanks, 
          data: dataBanks, 
          error: errorBanks} = useQuery(queryBanks, { context: { headers: getHeaders(location) },
                                                      notifyOnNetworkStatusChange: true, 
                                                      fetchPolicy: 'network-only', // Used for first execution
                                                      nextFetchPolicy: 'cache-first', // Used for subsequent executions
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
        case AMDINISTRATOR:{
          navigate("/withdraws")
          break;
        }
  
        case AUTHENTICATED:{
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

  const bankView = () =>{
    switch(mode){
      case "new":{
        <div>
          <label>{t("bank")}</label>
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
          <p className="text-red-500"> {_.isEmpty(error.bank) ? "" : error.bank} </p>  
        </div>
      }

      case "edit":{
        let f = _.find(banks, (bank)=>_.isEqual(bank._id, input?.bank?.bankId) )
        return <div>เลขที่บัญชี : {input?.bank?.bankNumber} - {f?.name}</div>
      }
    }
  }

  const balanceView = () =>{
    switch(mode){
      case "new":{
        <div>
          <label>ยอดเงิน * :</label>
          <input 
            type="number" 
            name="balance"
            value={ input.balance }
            onChange={ onInputChange }
            onBlur={ validateInput } />
          <p className="text-red-500"> {_.isEmpty(error.balance) ? "" : error.balance} </p>
        </div>
      }

      case "edit":{
        return <div>ยอดเงิน : {input.balance}</div>
      }
    }
  }
 
  return  <form  onSubmit={submitForm}>
            <div>
              {
                loadingBanks
                ? <LinearProgress /> 
                : bankView()
              }
              {balanceView()}
              {
                  mode == "edit" && checkRole(user) == AMDINISTRATOR 
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
            </div>
            <div>ยอดที่สามารถถอดได้ { user.balance - input.balance - user.balanceBook } บาท</div>
            <button type="submit" variant="contained" color="primary">{t("withdraw")}</button>
          </form>
}

const mapStateToProps = (state, ownProps) => {
    return { user:state.auth.user }
};

const mapDispatchToProps = { logout }

export default connect( mapStateToProps, mapDispatchToProps )(WithdrawPage);