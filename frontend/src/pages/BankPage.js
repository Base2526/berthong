import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import deepdash from "deepdash";
import { Button, Stack } from "@mui/material"

import BankInputField from "../fields/BankInputField"
deepdash(_);

const BankPage = (props) => {
  const { t } = useTranslation();
  let initValues = { bankNumber: "", bankId: "" }
  let [input, setInput]       = useState([initValues]);
  let { onMutationMe }  = props

  const submitForm = async(event) => {
    onMutationMe({ variables: { input: { type: "bank", mode: "new", data: input } } })
  }                    

  return  <div className="content-bottom">
            <div className="content-page border">
              <div className="row">
              <Stack
                direction="column"
                justifyContent="center"
                alignItems="flex-start">
                <BankInputField
                  label={t("search_by_id_bank")}
                  multiple={false}
                  values={input}
                  onChange={(value) => setInput(value) }/>
                <Button 
                  variant="contained" 
                  color="primary"  
                  size="small"
                  disabled={ _.isEmpty(_.filter(input, (b)=>b.bankId == "" || b.bankNumber == "")) ? false : true }
                  onClick={(evt)=>submitForm()}>{t("save")}</Button>
              </Stack>
              </div>
            </div>
          </div>
}

export default BankPage;