import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import _ from "lodash"
import { useQuery, useMutation } from "@apollo/client";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { 
  Stack,
  Button,
  LinearProgress,
  TextField,
  Autocomplete,
  Box
} from "@mui/material";

import { getHeaders, checkRole } from "./util"
import { queryDeposits, mutationDeposit, queryBanks, queryDepositById } from "./gqlQuery"
import { logout } from "./redux/actions/auth"
import { AMDINISTRATOR } from "./constants"
import AttackFileField from "./AttackFileField";

let initValues = {  balance: "", 
                    bank: null, 
                    status: "", 
                    dateTranfer: null, 
                    files:[] 
                  }

const DepositPage = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  let [snackbar, setSnackbar] = useState({open:false, message:""});
  let [input, setInput]       = useState(initValues);
  let [error, setError]       = useState(initValues);
  const [data, setData]       = useState({});

  let [ banks, setBanks ]       = useState([]);
  let { user, logout } = props
  let { mode, id } = location?.state

  const { loading: loadingBanks, 
          data: dataBanks, 
          error: errorBanks} = useQuery(queryBanks, { 
                                        context: { headers: getHeaders(location) }, 
                                        variables: {is_admin: true},
                                        fetchPolicy: 'network-only', // Used for first execution
                                        nextFetchPolicy: 'cache-first', // Used for subsequent executions
                                        notifyOnNetworkStatusChange: true });

  const [onMutationDeposit, resultMutationDeposit] = useMutation(mutationDeposit, {
    context: { headers: getHeaders(location) },
    update: (cache, {data: {deposit}}) => {
      let { data, mode, status } = deposit

      if(status){
        switch(mode){
          // case "new":{
          //   const queryDepositsValue = cache.readQuery({ query: queryDeposits });
          //   if(!_.isNull(queryDepositsValue)){
          //     let newData = [...queryDepositsValue.deposits.data, data];

          //     cache.writeQuery({
          //       query: queryDeposits,
          //       data: { deposits: {...queryDepositsValue.deposits, data: newData} }
          //     });
          //   }
          //   break;
          // }

          case "edit":{
            let queryDepositsValue = cache.readQuery({ query: queryDeposits });
            if(!_.isNull(queryDepositsValue)){
              let newData = _.map(queryDepositsValue.deposits.data, (item)=> item._id == data._id ? data : item ) 

              if(deposit.data.status == "approved" || deposit.data.status == "reject"){
                newData = _.filter(queryDepositsValue.deposits.data, (item)=> item._id != data._id ) 
              }

              cache.writeQuery({
                query: queryDeposits,
                data: { deposits: {...queryDepositsValue.deposits, data: newData} }
              });
            }
            break;
          }
        }
      }
    },
    onCompleted({ data }) {
      // history.goBack()
      navigate(-1);
    },
    onError(error){
      console.log("onError :", error)
    }
  });

  let { loading: loadingDepositById, 
        data: dataDepositById, 
        error: errorDepositById,
        refetch: refetchDepositById } =  useQuery(queryDepositById, {
                                                  context: { headers: getHeaders(location) },
                                                  variables: {id},
                                                  fetchPolicy: 'network-only', // Used for first execution
                                                  nextFetchPolicy: 'cache-first', // Used for subsequent executions
                                                  notifyOnNetworkStatusChange: true,
                                                })

  useEffect(()=>{
    if( !loadingDepositById && mode == "edit"){
      if(!_.isEmpty(dataDepositById?.depositById)){
        let { status, data } = dataDepositById.depositById
        if(status){
          console.log("useEffect :", data)
          setInput({
            balance: data.balance, 
            bank: data?.bank, 
            status: data.status, 
            dateTranfer: new Date(data.dateTranfer), 
            files: data.files
          })
        }
      }
    }
  }, [dataDepositById, loadingDepositById])
                                                
  useEffect(()=>{
    if(mode == "edit" && id){
      refetchDepositById({id});
    }
  }, [id])

  useEffect(()=>{
    if(!loadingBanks){
      if(!_.isEmpty(dataBanks?.banks)){
        let { status, data } = dataBanks?.banks
        if(status) setBanks(data)
      }
    }
  }, [dataBanks, loadingBanks])

  const submitForm = async(event) => {
    /*
    switch(mode){
      case "new":{
        let newInput =  {
          mode: mode.toUpperCase(),
          balance: parseInt(input.balance),
          dateTranfer: input.dateTranfer,
          bank: _.omit(_.find(banks, (b)=> _.isEqual(b?._id, input.bank)), ['bankName']),
          files: input.files
        }
        // console.log("newInput :", newInput)
        onMutationDeposit({ variables: { input: newInput } });
        break;
      }

      case "edit":{

        break;
      }
    }

    // onMutationDeposit({ variables: { input: newInput } });
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

  return  <Stack
            direction="column"
            justifyContent="center"
            alignItems="flex-start">
              {
                loadingBanks
                ? <LinearProgress /> 
                : <Box alignItems="stretch">
                    <Autocomplete
                      label={"เลือกธนาคารที่โอน *"}
                      disablePortal
                      id="bank"
                      sx={{ width: 300 }}
                      options={banks}
                      getOptionLabel={(option)=>`${option.bankNumber} (${option.name})`}
                      defaultValue={ _.find(banks, (v)=>input?.bank?._id === v._id) }
                      renderInput={(params) =>{
                        return  <TextField {...params} label={t("bank_account_name")} required={_.isEmpty(input?.bank?._id) ? true : false} />
                      } }
                      onChange={(event, bank) => setInput({...input, bank})}
                    />
                    <p className="text-red-500"> {_.isEmpty(error.bank) ? "" : error.bank} </p>  
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
                <p className="text-red-500"> {_.isEmpty(error.balance) ? "" : error.balance} </p>
              </Box>
              <Box>
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
              </Box>
              <AttackFileField
                label={t("attack_file")}
                values={input.files}
                multiple={false}
                onChange={(values) => {
                    setInput({...input, files: values})
                }}
                onSnackbar={(data) => {
                    setSnackbar(data);
                }}/>
                {
                  checkRole(user) == AMDINISTRATOR 
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
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              onClick={evt=>{ submitForm(evt) }}>{t("deposit")}</Button>
          </Stack>
}

const mapStateToProps = (state, ownProps) => {
    return { }
};

const mapDispatchToProps = { logout }
export default connect( mapStateToProps, mapDispatchToProps )(DepositPage);