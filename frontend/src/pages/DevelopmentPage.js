import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import _ from "lodash"
import { useQuery, useMutation } from "@apollo/client";
import { useTranslation } from "react-i18next";
import moment from "moment";
import { LinearProgress } from "@mui/material";

import { mutationCheck_db } from "../apollo/gqlQuery"
import { getHeaders, handlerErrorApollo } from "../util"
import DialogComp from "../components/DialogComp"

const DevelopmentPage = (props) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();

  let [data, setData] = useState("")
  let [openDialog, setOpenDialog] = useState(false)

  const [onMutationCheck_db, resultMutationCheck_db] = useMutation(mutationCheck_db,{
    context: { headers: getHeaders(location) },
    update: (cache, {data: { check_db }}, context) => {
      console.log("check_db :", check_db)

      let { status, mongo_db_state, env } = check_db
      if(status){
        setData(JSON.stringify(env))
        setOpenDialog(true)
      }
    },
    onCompleted(data) {},
    onError: (error) => handlerErrorApollo( props, error )
  });

  return (<div className="dblog-list-container">
            <div>
              <button onClick={()=>{
                  setData(JSON.stringify(process.env)); 
                  setOpenDialog(true); 
                }}>ENV (Frontend)</button>
              <button onClick={()=>{onMutationCheck_db()}}>ENV (Backend)</button>
            </div>
            { openDialog && <DialogComp open={openDialog} data={ data } onHandleClose={()=>setOpenDialog(false)}/> }
          </div>)
}
export default DevelopmentPage;
