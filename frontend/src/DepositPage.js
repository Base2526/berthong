import React, { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import _ from "lodash"
import DatePicker from "react-datepicker";

import { 
  Stack,
  Button,
  TextField,
  Autocomplete,
  Box
} from "@mui/material";

import * as Constants from "./constants"
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

  const [snackbar, setSnackbar] = useState({open:false, message:""});
  const [input, setInput]       = useState(initValues);
  const [error, setError]       = useState(initValues);
  const { onMutationDeposit } = props

  const submitForm = async(event) => {
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

  return  useMemo(() => {
            return  <Stack
                      direction="column"
                      justifyContent="center"
                      alignItems="flex-start"
                      spacing={2}>
                      <Box>
                        <Autocomplete
                          disablePortal
                          id="combo-box-bank"
                          options={ Constants.BANKS }
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
                      <Button 
                        type="submit" 
                        variant="contained" 
                        color="primary"
                        disabled={input.balance == "" || input.bankId == "" || _.isNull(input.date) || _.isUndefined(input.file) ? true : false   }
                        onClick={evt=>{ submitForm(evt) }}>{t("deposit")}</Button>
                    </Stack>
          }, [input]);
}

export default DepositPage;