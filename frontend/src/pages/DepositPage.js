import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@apollo/client";
import _ from "lodash"
import DatePicker from "react-datepicker";
import { 
  Stack,
  Button,
  TextField,
  Autocomplete,
  Box,
  LinearProgress,
  IconButton
} from "@mui/material";
import { TbClipboardCopy as AiOutlineCopy } from "react-icons/tb";

import * as Constants from "../constants"
import AttackFileField from "../components/AttackFileField";
import { queryAdminBanks } from "../apollo/gqlQuery";
import { handlerErrorApollo,  getHeaders, showToast } from "../util";

import scbIcon from "../images/scb.png";

let initValues = {  balance: "", 
                    bankId: "", 
                    date: null, 
                    file: undefined,
                    remark: ""
                  }

const DepositPage = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  let [banks, setBanks] = useState([]);

  const [snackbar, setSnackbar] = useState({open:false, message:""});
  const [input, setInput]       = useState(initValues);
  const [error, setError]       = useState(initValues);
  const { onMutationDeposit } = props

  const { loading: loadingAdminBanks, 
          data: dataAdminBanks, 
          error: errorAdminBanks, 
          networkStatus: networkStatusAdminBanks } =  useQuery(queryAdminBanks, 
                                                        { 
                                                          context: { headers: getHeaders(location) }, 
                                                          fetchPolicy: 'cache-first', 
                                                          nextFetchPolicy: 'network-only', 
                                                          notifyOnNetworkStatusChange: true
                                                        }
                                                      );

  useEffect(() => {
    if(!loadingAdminBanks){
      if(!_.isEmpty(dataAdminBanks?.adminBanks)){
        let { status, data } = dataAdminBanks?.adminBanks
        if(status){
          setBanks(data)
        }
      }
    }
  }, [dataAdminBanks, loadingAdminBanks])

  const submitForm = async(event) => {
    console.log("input :", input)
    onMutationDeposit({ variables: { input } });
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

  return  <div className="row"> 
            {
              loadingAdminBanks || _.isEmpty(banks)
              ? <LinearProgress />
              : // useMemo(() => {
                <div className="content-bottom">
                  <div className="content-page border"> 
                    
                    <div className="row m-2">
                      <div className="row p-3 MuiTypography-h6">
                        {
                          _.map(banks, bank=>{
                            console.log("bank :", bank)
                            return  <div>
                                      <div className="d-flex flex-row">
                                        <div>
                                          <img className="rounded float-left bank-icon" src={scbIcon} />
                                        </div>
                                        <div className="ms-3">
                                          <div>ชื่อบัญชี: {bank?.name_account}</div>
                                          <div>เลขบัญชี: {bank?.number} 
                                          <IconButton onClick={async()=>{
                                            let text = bank?.number
                                            if ('clipboard' in navigator) {
                                              await navigator.clipboard.writeText(text);
                                            } else {
                                              document.execCommand('copy', true, text);
                                            }
                                            showToast("info", `Copy`)
                                          }}><AiOutlineCopy size={20} round /></IconButton></div> 
                                        </div>
                                      </div>
                                      <div class="pt-4">
                                        <div>ฝากขั้นต่ำ 99 บาท ขึ้นไปเท่านั้น! ถอนขั้นต่ำ 100 บาท</div>
                                      </div>
                                    </div>
                          })
                        }
                      </div>
                      {/* 
                      <div className="col-lg-6 col-12">
                        <div className="row border-c p-2">
                          <div className="col-4">
                            <img style={{width:"60px", height:"60px", borderRadius:"5px"}} src="data:image/png;base64,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"/>
                          </div>
                          <div className="col-8" style={{margin:"auto"}}>
                              ธนาคารกรุงไทย <br />
                              เลขที่ xxx-xxx-xxx-xxx <br />
                              ชื่อ online online <br />
                          </div>
                        </div> 
                        <div className="row border-c p-2 mt-3 mb-3">
                          <div className="col-4">
                            <img style={{width:"60px", height:"60px", borderRadius:"5px"}} src="data:image/png;base64,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"/>
                          </div>
                          <div className="col-8" style={{margin:"auto"}}>
                              ธนาคารกรุงไทย <br />
                              เลขที่ xxx-xxx-xxx-xxx <br />
                              ชื่อ online online <br />
                          </div>
                        </div>
                      </div>
                      */}
                      <div className="col-lg-6 col-12">
                        <div className="row">
                        <Stack
                          direction="column"
                          justifyContent="center"
                          alignItems="flex-start"
                          spacing={2}>
                          <Box>
                            <Autocomplete
                              disablePortal
                              id="combo-box-bank"
                              options={ banks }
                              sx={{ width: 200 }}
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
                              sx={{ width: 200 }}
                              onChange={ onInputChange }
                              onBlur={ validateInput } />
                            <p className="text-red-500"> {_.isEmpty(error.balance) ? "" : error.balance} </p>
                          </Box>
                          <Box className="date-p">
                            <DatePicker
                              sx={{ width: 200 }}
                              label={t("date_tranfer")}
                              placeholderText={t("date_tranfer")}
                              filterDate={(date)=>date < new Date()} // disable next date
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
                          <Box>
                            <TextField
                              id="remark"
                              name="remark"
                              label="หมายเหตุ"
                              value={ input.remark }
                              multiline
                              rows={4}
                              // defaultValue=""
                              onChange={ onInputChange }
                              onBlur={ validateInput }
                              // variant="standard"
                            />
                          </Box>
                          <Button 
                            type="submit" 
                            variant="contained" 
                            color="primary"
                            disabled={input.balance == "" || input.bankId == "" || _.isNull(input.date) || _.isUndefined(input.file) ? true : false   }
                            onClick={evt=>{ submitForm(evt) }}>{t("deposit")}</Button>
                        </Stack>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              // }, [input])
            }
          </div>
}

export default DepositPage;