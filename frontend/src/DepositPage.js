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
// import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Autocomplete from "@mui/material/Autocomplete";


import { getHeaders, checkRole } from "./util"
import { queryDeposits, queryDepositById, mutationDeposit } from "./gqlQuery"
import { logout } from "./redux/actions/auth"
import { AMDINISTRATOR } from "./constants"
import AttackFileField from "./AttackFileField";


let initValues = { balance: "", status: "wait", dateTranfer: null, attackFiles:[] }

const DepositPage = (props) => {
  let history = useHistory();
  let location = useLocation();
  let { t } = useTranslation();
  let [snackbar, setSnackbar] = useState({open:false, message:""});
  let [input, setInput]       = useState(initValues);
  let [error, setError]       = useState(initValues);

  // const [startDate, setStartDate] = useState(new Date());

  let { user, logout } = props
  let { mode, id } = location.state

  console.log("location.state : ", location.state)


  let editValues = null;

  console.log("user :", user)

  const [onMutationDeposit, resultMutationDeposit] = useMutation(mutationDeposit, {
    context: { headers: getHeaders() },
    update: (cache, {data: {deposit}}) => {
      let { data, mode, status } = deposit
      console.log("")

      if(status){
        
        switch(mode){
          case "new":{
            const queryDepositsValue = cache.readQuery({ query: queryDeposits });
            let newData = [...queryDepositsValue.deposits.data, data];

            cache.writeQuery({
              query: queryDeposits,
              data: { deposits: {...queryDepositsValue.deposits, data: newData} }
            });
            break;
          }

          case "edit":{
            let queryDepositsValue = cache.readQuery({ query: queryDeposits });

            let newData = _.map(queryDepositsValue.deposits.data, (item)=> item._id == data._id ? data : item ) 

            if(deposit.data.status == "approved" || deposit.data.status == "reject"){
              newData = _.filter(queryDepositsValue.deposits.data, (item)=> item._id != data._id ) 
            }

            cache.writeQuery({
              query: queryDeposits,
              data: { deposits: {...queryDepositsValue.deposits, data: newData} }
            });
            
            break;
          }
        }
        
      }
    },
    onCompleted({ data }) {
      history.goBack()
    },
    onError({error}){
      console.log("onError :")
    }
  });
  console.log("resultMutationDeposit :", resultMutationDeposit)

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
      balance: parseInt(input.balance),
      dateTranfer: input.dateTranfer,
      status: input.status,
      files: input.attackFiles
    }

    if(mode == "edit"){
      newInput = {...newInput, _id: editValues.data.depositById.data._id}
    }

    console.log("newInput :", newInput)
    onMutationDeposit({ variables: { input: newInput } });
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
        case "balance": {
          if (!value) {
            stateObj[name] = "Please enter Balance.";
          }
          break;
        }

        case "dateTranfer": {
          if (!value) {
            stateObj[name] = "Please enter Date-tranfer.";
          }
          break;
        }
        
        default:
          break;
      }
      return stateObj;
    });
  };
  // 
  switch(mode){
    case "new":{
      return  <LocalizationProvider dateAdapter={AdapterDateFns} >
                <Box component="form" sx={{ "& .MuiTextField-root": { m: 1, width: "50ch" } }} onSubmit={submitForm}>
                  <div >
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

                    {/* <DesktopDatePicker
                      label={t("date_tranfer")}
                      inputFormat="dd/MM/yyyy"
                      value={ input.dateTranfer }
                      onChange={(newDate) => {
                        setInput({...input, dateTranfer: newDate})
                      }}
                      renderInput={(params) => <TextField {...params} required={input.dateTranfer === null ? true: false} />}
                    /> */}

                    <DatePicker
                      label={t("date_tranfer")}
                      placeholderText={t("date_tranfer")}
                      required={true}
                      selected={input.dateTranfer}
                      onChange={(date) => {
                        setInput({...input, dateTranfer: date})
                      }}
                      timeInputLabel="Time:"
                      dateFormat="MM/dd/yyyy h:mm aa"
                      showTimeInput/>

                    <AttackFileField
                      label={t("attack_file")}
                      values={input.attackFiles}
                      onChange={(values) => {
                          console.log("AttackFileField :", values)
                          setInput({...input, attackFiles: values})
                      }}
                      onSnackbar={(data) => {
                          setSnackbar(data);
                      }}/>
                  </div>
                  <Button type="submit" variant="contained" color="primary">
                      {t("deposit")}
                  </Button>
                </Box>
              </LocalizationProvider>
    }

    case "edit":{
      editValues = useQuery(queryDepositById, {
                        context: { headers: getHeaders() },
                        variables: {id},
                        notifyOnNetworkStatusChange: true,
                      });

      console.log("editValues :", editValues)

      if(_.isEqual(input, initValues)) {
        if(!_.isEmpty(editValues)){
          let {loading}  = editValues
          
          if(!loading){
            let {status, data} = editValues.data.depositById

            console.log("edit editValues : ", data)
            if(status){
              setInput({
                balance: data.balance,
                dateTranfer: new Date(data.dateTranfer),
                attackFiles: data.files,
                status: data.status
              })
            }
          }
        }
      }

      return  editValues != null && editValues.loading
                ? <div><CircularProgress /></div> 
                : <LocalizationProvider dateAdapter={AdapterDateFns} >
                    <Box component="form" sx={{ "& .MuiTextField-root": { m: 1, width: "50ch" } }} onSubmit={submitForm}>
                      <div >
                      <TextField
                        id="balance"
                        name="balance"
                        label={"ยอดเงิน"}
                        variant="filled"
                        type="number"
                        required
                        value={ input.balance }
                        onChange={onInputChange}
                        onBlur={validateInput}
                        helperText={ _.isEmpty(error.balance) ? "" : error.balance }
                        error={_.isEmpty(error.balance) ? false : true}/>
                        {/* <DesktopDatePicker
                          label={"ออกงวดวันที่"}
                          inputFormat="dd/MM/yyyy"
                          value={ input.dateLottery }
                          onChange={(newDate) => {
                              setInput({...input, dateLottery: newDate})
                          }}
                          renderInput={(params) => <TextField {...params} required={input.dateLottery === null ? true: false} />}/> */}
                        
                        <DatePicker
                          label={t("date_tranfer")}
                          placeholderText={t("date_tranfer")}
                          required={true}
                          selected={input.dateTranfer}
                          onChange={(date) => {
                            setInput({...input, dateTranfer: date})
                          }}
                          timeInputLabel="Time:"
                          dateFormat="MM/dd/yyyy h:mm aa"
                          showTimeInput/>
                        
                        {/* <Editor 
                          label={t("detail")} 
                          initData={ input.description }
                          onEditorChange={(newDescription)=>{
                              setInput({...input, description: newDescription})
                          }}/> */}
                        <AttackFileField
                          label={t("attack_file")}
                          values={input.attackFiles}
                          onChange={(values) => {
                              console.log("AttackFileField :", values)
                              setInput({...input, attackFiles: values})
                          }}
                          onSnackbar={(data) => {
                              setSnackbar(data);
                          }}/>

                          {adminView()}
                      </div>
                      <Button type="submit" variant="contained" color="primary">{t("deposit")}</Button>
                    </Box>
                  </LocalizationProvider>
    }

    default:{
      break;
    }
  }
  return (<div style={{flex:1}}>ฟอร์ม แจ้งฝากเงิน</div>);
}

const mapStateToProps = (state, ownProps) => {
    return { user:state.auth.user }
};

const mapDispatchToProps = { logout }

export default connect( mapStateToProps, mapDispatchToProps )(DepositPage);