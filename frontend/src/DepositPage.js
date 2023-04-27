import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import _ from "lodash"
import { useQuery } from "@apollo/client";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { 
  Stack,
  Button,
  LinearProgress,
  TextField,
  Autocomplete,
  Box,
  Avatar
} from "@mui/material";

// import { getHeaders, checkRole, showToast } from "./util"
// import { queryDeposits, mutationDeposit, queryBanks, queryDepositById } from "./gqlQuery"
// import { logout } from "./redux/actions/auth"
import { BANKS } from "./constants"
import AttackFileField from "./AttackFileField";

let initValues = {  balance: "", 
                    bankId: "", 
                    date: null, 
                    file: undefined
                  }

const DepositPage = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { REACT_APP_BANKS } = process.env

  let [snackbar, setSnackbar] = useState({open:false, message:""});
  let [input, setInput]       = useState(initValues);
  let [error, setError]       = useState(initValues);
  let [editData, setEditData]       = useState({});

  let [ banks, setBanks ]       = useState([]);
  let { onMutationDeposit } = props
  // let { mode, id } = location?.state

  // _.map(REACT_APP_BANKS, (bank)=>{console.log("bank :", bank) })

  // const { loading: loadingBanks, 
  //         data: dataBanks, 
  //         error: errorBanks} = useQuery(queryBanks, { 
  //                                       context: { headers: getHeaders(location) }, 
  //                                       variables: {is_admin: true},
  //                                       fetchPolicy: 'network-only', 
  //                                       nextFetchPolicy: 'cache-first', 
  //                                       notifyOnNetworkStatusChange: true });

  // let { loading: loadingDepositById, 
  //       data: dataDepositById, 
  //       error: errorDepositById,
  //       refetch: refetchDepositById } =  useQuery(queryDepositById, {
  //                                                 context: { headers: getHeaders(location) },
  //                                                 fetchPolicy: 'network-only', // Used for first execution
  //                                                 nextFetchPolicy: 'cache-first', // Used for subsequent executions
  //                                                 notifyOnNetworkStatusChange: true,
  //                                               })

  // useEffect(()=>{
  //   if( !loadingDepositById && mode == "edit"){
  //     if(!_.isEmpty(dataDepositById?.depositById)){
  //       let { status, data } = dataDepositById.depositById
  //       if(status){
  //         setEditData(data)
  //       }
  //     }
  //   }
  // }, [dataDepositById, loadingDepositById])
                                                
  // useEffect(()=>{
  //   if(mode == "edit" && id){
  //     refetchDepositById({id});
  //   }
  // }, [id])

  // useEffect(()=>{
  //   if(!loadingBanks){
  //     if(!_.isEmpty(dataBanks?.banks)){
  //       let { status, data } = dataBanks?.banks
  //       if(status) setBanks(data)
  //     }
  //   }
  // }, [dataBanks, loadingBanks])

  useEffect(()=>{
    console.log("input :", input)
  }, [input])

  const submitForm = async(event) => {
    onMutationDeposit({ variables: { input } });
    // switch(mode){
    //   case "new":{
    //     let bank = input?.bank;
    //     bank = _.omit(bank, ['name'])

    //     let newInput =  {
    //       mode: mode.toUpperCase(),
    //       balance: parseInt(input?.balance),
    //       dateTranfer: input?.dateTranfer,
    //       bank,
    //       files: input?.files
    //     }

    //     onMutationDeposit({ variables: { input: newInput } });
    //     break;
    //   }

    //   case "edit":{
    //     let newInput =  {
    //       mode: mode.toUpperCase(),
    //       _id: editData?._id,
    //       status: parseInt(editData?.status),
    //     }

    //     console.log("edit :", newInput)
    //     onMutationDeposit({ variables: { input: newInput } });
    //     break;
    //   }
    // }
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

        case "date": {
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

  // const mainView = () =>{
  //   switch(mode){
  //     case "new":{
  //       return  <>
  //                 {
  //                   loadingBanks
  //                   ? <LinearProgress /> 
  //                   : <Box alignItems="stretch">
  //                       <Autocomplete
  //                         label={"เลือกธนาคารที่โอน *"}
  //                         disablePortal
  //                         id="bank"
  //                         sx={{ width: 300 }}
  //                         options={banks}
  //                         getOptionLabel={(option)=>`${option.bankNumber} (${option.name})`}
  //                         defaultValue={ _.find(banks, (v)=>input?.bank?._id === v._id) }
  //                         renderInput={(params) =>{
  //                           return  <TextField {...params} label={t("bank_account_name")} required={_.isEmpty(input?.bank?._id) ? true : false} />
  //                         } }
  //                         onChange={(event, bank) => setInput({...input, bank})}
  //                       />
  //                       <p className="text-red-500"> {_.isEmpty(error.bank) ? "" : error.bank} </p>  
  //                     </Box>  
  //                 }
  //                 <Box>
  //                   <TextField 
  //                     type="number" 
  //                     name="balance"
  //                     label={"ยอดเงิน *"}
  //                     value={ input.balance }
  //                     sx={{ width: 300 }}
  //                     onChange={ onInputChange }
  //                     onBlur={ validateInput } />
  //                   <p className="text-red-500"> {_.isEmpty(error.balance) ? "" : error.balance} </p>
  //                 </Box>
  //                 <Box>
  //                   <DatePicker
  //                     label={t("date_tranfer")}
  //                     placeholderText={t("date_tranfer")}
  //                     required={true}
  //                     selected={input.dateTranfer}
  //                     onChange={(date) => {
  //                       setInput({...input, dateTranfer: date})
  //                     }}
  //                     timeInputLabel="Time:"
  //                     dateFormat="MM/dd/yyyy h:mm aa"
  //                     showTimeInput/>
  //                 </Box>
  //                 <AttackFileField
  //                   label={t("attack_file")}
  //                   values={input.files}
  //                   multiple={false}
  //                   onChange={(values) => {
  //                       setInput({...input, files: values})
  //                   }}
  //                   onSnackbar={(data) => {
  //                       setSnackbar(data);
  //                   }}/>
  //               </>
  //     }

  //     case "edit":{
  //        return loadingDepositById 
  //               ? <LinearProgress />
  //               : _.isEmpty(editData)
  //                 ? <div>Empty data</div> 
  //                 : <>
  //                     <div>
  //                       <label>เลือกธนาคารที่โอน</label>
  //                       <div> { editData?.bank?.bankNumber } </div>
  //                     </div> 
  //                     <div>
  //                       <label>ยอดเงิน</label>
  //                       <div> { editData?.balance } </div>
  //                     </div>
  //                     <div>
  //                       <label>วันที่โอนเงิน</label>
  //                       <div> { editData?.dateTranfer } </div>
  //                     </div>
  //                     <div>
  //                       <label>รูป</label>
  //                       <Avatar
  //                         alt="Example avatar"
  //                         variant="rounded"
  //                         src={editData?.files[0].url}
  //                         // onClick={(e) => {
  //                         //   onLightbox({ isOpen: true, photoIndex: 0, images:files })
  //                         // }}
  //                         sx={{ width: 56, height: 56 }}
  //                       />
  //                     </div>
  //                     <div>
  //                       <label>{t("status")} </label>
  //                       <select 
  //                         name="status" 
  //                         id="status" 
  //                         value={editData.status}
  //                         onChange={ (e)=>{
  //                           const { name, value } = e.target;
  //                           setEditData({...editData, status: value})
  //                         } }
  //                         // onBlur={ validateInput }
  //                         >
  //                         <option value={""}>ไม่เลือก</option>
  //                         { _.map([ {id: 0, name: 'wait'},{id: 1, name: 'approved'}, {id: 2, name: 'reject'} /*'wait','approved', 'reject'*/ ], (item, id)=><option key={id} value={item?.id}>{item?.name}</option>) }
  //                       </select> 
  //                       <p className="text-red-500"> {_.isEmpty(error.status) ? "" : error.status} </p>  
  //                     </div>
  //                   </>
  //     }
  //   }
  // }

  return  <Stack
            direction="column"
            justifyContent="center"
            alignItems="flex-start"
            spacing={2}>
            <Box>
              <Autocomplete
                disablePortal
                id="combo-box-bank"
                options={ BANKS }
                sx={{ width: 300 }}
                renderInput={(params) => <TextField {...params} label="บัญชีธนาคาร" />}
                onChange={(event, value) => {
                  setInput({...input, bankId: value?.id})
                }}
              />
            </Box>
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
                selected={input.date}
                onChange={(value) => {
                  setInput({...input, date: value})
                }}
                timeInputLabel="Time:"
                dateFormat="MM/dd/yyyy h:mm aa"
                showTimeInput/>
            </Box>
            <Box>
              <AttackFileField
                label={t("attack_file")}
                values={ _.isUndefined(input.file) ? [] : [input.file]}
                multiple={false}
                onChange={(value) => {
                  setInput({...input, file: value[0]})
                }}
                onSnackbar={(data) => {
                  // setSnackbar(data);
                }}/>
            </Box>

            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={input.balance == "" || input.bankId == "" || _.isNull(input.date) /*|| _.isUndefined(input.file)*/ ? true : false   }
              onClick={evt=>{ submitForm(evt) }}>{t("deposit")}</Button>
          </Stack>
}

export default DepositPage;