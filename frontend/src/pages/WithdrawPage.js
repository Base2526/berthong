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
import BankComp from "../components/BankComp"

let initValues = { bankId: "",  balance: "" }

const WithdrawPage = (props) => {
  const navigate                = useNavigate();
  const location                = useLocation();
  const { t }                   = useTranslation();
  const [input, setInput]       = useState(initValues);
  const [error, setError]       = useState(initValues);
  const [banks, setBanks]       = useState([]);

  const { user, onMutationWithdraw } = props

  useEffect(()=>{
    console.log( "input :", input, initValues, _.isEqual(input, initValues) )
  }, [input])

  const submitForm = async(event) => {
    onMutationWithdraw({ variables: { input } }); 
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

  return  <div className="content-bottom">
            <div className="content-page border">
              <div className="row">
              {
                _.isEmpty(user?.banks)
                ? <Stack
                    direction="column"
                    justifyContent="center"
                    alignItems="flex-start"
                    spacing={2}>
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={(evt)=>navigate("/bank")}>เพิ่ม บัญชีธนาคาร</Button>
                  </Stack>
                : <Stack
                    direction="column"
                    justifyContent="center"
                    alignItems="flex-start"
                    spacing={2}>
                    <Box> 
                      {/* <Autocomplete
                        label={"เลือกบัญชี *"}
                        disablePortal
                        id="bank"
                        sx={{ width: 300 }}
                        options={ user?.banks }
                        getOptionLabel={(option)=>`${option.bankNumber} (${option.name})`}
                        renderInput={(params) =><TextField {...params} label={t("bank_account_name")} /> }
                        onChange={(event, val) => setInput({...input, bankId: val?._id}) }/> */}
                      <BankComp 
                        {...props}
                        banks={user?.banks}
                        onChange={(event, val)=>setInput({...input, bankId: val?._id})}/>
                    </Box>
                    <Box> 
                      <TextField 
                        type="number" 
                        name="balance"
                        label={"ยอดเงิน *"}
                        value={ input.balance }
                        sx={{ width: 300 }}
                        onChange={(e)=>{
                            setInput({...input, balance: parseInt( e.target?.value ) })
                        } }
                        onBlur={ validateInput } /> 
                    </Box>
                    <Box>
                      <div>ยอดที่สามารถถอดได้ { isWithdraw() } บาท</div>
                    </Box>
                    <Button 
                      variant="contained" 
                      color="primary"
                      disabled={ input.bankId != "" && input.balance != "" && isWithdraw() > 0 ? false : true }
                      onClick={(evt)=>submitForm(evt)}>{t("withdraw")}</Button>
                  </Stack>
              }
             
              </div>
            </div>
          </div>
}

export default WithdrawPage