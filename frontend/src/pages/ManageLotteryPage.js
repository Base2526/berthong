import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { useTranslation } from "react-i18next";
import {
  Stack,
  Box,
  Button,
  TextField,
  CircularProgress
} from "@mui/material"
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import _ from "lodash";

import {  queryManageLotteryById, 
          queryManageLotterys, 
          mutationManageLottery, 
          mutationCalculateLottery, 
          mutationExpireLottery } from "../apollo/gqlQuery"
import { getHeaders, handlerErrorApollo, showToast } from "../util"
import { validateSDL } from "graphql/validation/validate";

let editValues = undefined;
let initValues =  { mode: "new", 
                    // kindLottery: null,
                    title: "", 
                    start_date_time: null, 
                    end_date_time: null, 
                    bon: null, 
                    lang: null }

const ManageLotteryPage = (props) => {
  let location = useLocation();
  let navigate = useNavigate();
  const { t } = useTranslation();
  let [input, setInput] = useState(initValues)

  let { mode, _id } = location.state

  // mutationExpireLottery
  const [onMutationExpireLottery, resultMutationExpireLottery] = useMutation(mutationExpireLottery
    , {
        context: { headers: getHeaders(location) },
        update: (cache, {data: {expireLottery}} ) => {
          console.log("ExpireLottery :", expireLottery)
          
          // let { status, data: newData } = manageLottery
          // if(status){
          //   let queryManageLotterysValue = cache.readQuery({ query: queryManageLotterys });
          //   if(queryManageLotterysValue){
          //     let filterData = _.filter(queryManageLotterysValue.manageLotterys.data, (v)=>v._id !== newData._id)
          //     cache.writeQuery({
          //       query: queryManageLotterys,
          //       data: { manageLotterys: {...queryManageLotterysValue.manageLotterys, data: [...filterData, newData] } },
          //     });
          //   }
          // }
        },
        onCompleted(data) {
          // navigate(-1)
          showToast("success", "Set expire success")
        },
        onError(error){
          return handlerErrorApollo( props, error )
        }
      }
  );

  const [onMutationCalculateLottery, resultMutationCalculateLottery] = useMutation(mutationCalculateLottery
    , {
        context: { headers: getHeaders(location) },
        update: (cache, {data: {calculateLottery}} ) => {
          console.log("calculateLottery :", calculateLottery)
          
          // let { status, data: newData } = manageLottery
          // if(status){
          //   let queryManageLotterysValue = cache.readQuery({ query: queryManageLotterys });
          //   if(queryManageLotterysValue){
          //     let filterData = _.filter(queryManageLotterysValue.manageLotterys.data, (v)=>v._id !== newData._id)
          //     cache.writeQuery({
          //       query: queryManageLotterys,
          //       data: { manageLotterys: {...queryManageLotterysValue.manageLotterys, data: [...filterData, newData] } },
          //     });
          //   }
          // }
        },
        onCompleted(data) {
          // navigate(-1)
          showToast("success", "คำนวนหวยเรียบร้อย")
        },
        onError(error){
          return handlerErrorApollo( props, error )
        }
      }
  );

  const [onMutationManageLottery, resultMutationManageLotteryValues] = useMutation(mutationManageLottery
    , {
        context: { headers: getHeaders(location) },
        update: (cache, {data: {manageLottery}}, context) => {
          console.log("manageLottery :", manageLottery, context?.variables)
          
          let { mode } = context?.variables?.input
          let { status, data: newData } = manageLottery
          if(status){

            switch(mode){
              case "new":{
                let queryManageLotterysValue = cache.readQuery({ query: queryManageLotterys });
                if(queryManageLotterysValue){
                  let manageLotterys = {...queryManageLotterysValue.manageLotterys, data: [...queryManageLotterysValue.manageLotterys.data, newData] }
                  cache.writeQuery({
                    query: queryManageLotterys,
                    data: { manageLotterys },
                  });
                }
                break
              }

              case "edit":{

                let queryManageLotterysValue = cache.readQuery({ query: queryManageLotterys });
                if(queryManageLotterysValue){
                  let updateData = _.map(queryManageLotterysValue.manageLotterys.data, (v)=>v._id === newData._id ? newData : v)
                  let manageLotterys = {...queryManageLotterysValue.manageLotterys, data: updateData }
                  cache.writeQuery({
                    query: queryManageLotterys,
                    data: { manageLotterys },
                  });
                }
                break
              }
            }
            
            
          }
        },
        onCompleted(data) {
          navigate(-1)
        },
        onError(error){
          return handlerErrorApollo( props, error )
        }
      }
  );

  const { loading: loadingManageLotteryById, 
          data: dataManageLotteryById, 
          error: errorManageLotteryById,
          refetch: refetchManageLotteryById} =  useQuery(queryManageLotteryById, 
                                                          {
                                                            context: { headers: getHeaders(location) }, 
                                                            fetchPolicy: 'cache-first', 
                                                            nextFetchPolicy: 'network-only', 
                                                            notifyOnNetworkStatusChange: true,
                                                          }
                                                        );

  useEffect(()=>{
    if(mode == "edit" && _id){
      refetchManageLotteryById({id: _id});
    }
  }, [_id])

  useEffect(()=>{
    if(mode == "edit"){
      if (dataManageLotteryById) {
        let { status, data } = dataManageLotteryById.manageLotteryById
        if(status){
          setInput({  
                      mode, 
                      // kindLottery: data?.kindLottery,
                      title: data?.title,
                      start_date_time: new Date(data?.start_date_time), 
                      end_date_time: new Date(data?.end_date_time), 
                      bon: data?.bon, 
                      lang: data?.lang, 
                    })
        }
      }
    }
  }, [dataManageLotteryById])

  const submitForm = (event) => {
    event.preventDefault();
    onMutationManageLottery({ variables: { input: mode == "edit" ? {...input, _id } : input } })
  };

  const onExpire = () =>{
    onMutationExpireLottery({ variables: { input: { _id } } })
  }

  const onCalculate = () =>{
    onMutationCalculateLottery({ variables: { input: { _id } } })
  }

  return (
    <div>
      {
        loadingManageLotteryById
        ?<CircularProgress />
        :<Box component="form" sx={{ "& .MuiTextField-root": { m: 1, width: "50ch" } }} >
          <Stack spacing={2}>

          {/* <div>
            <label>เลือกประเภทหวย * :</label>
            {
              // _.isEmpty(manageLotterys) 
              // ? <LinearProgress />
              // : 
                <select 
                  name="kindLottery" 
                  id="kindLottery" 
                  value={ input.kindLottery }
                  onChange={(e) => {
                    console.log("kindLottery : ", e.target.value)
                    setInput({...input, kindLottery:e.target.value})
                  }}
                  // onChange={ onInputChange }
                  // onBlur={ validateInput } 
                  >
                  <option value={""}>ไม่เลือก</option>
                  {_.map([{_id: 0, title: 'thai'}, {_id: 1, title: 'laos'}, {_id: 2, title: 'vietnam'}], (kind)=><option value={kind._id}>{ kind?.title }</option>)}
                </select>
            }
          </div> */}


          <TextField
            id="filled-basic"
            title="title"
            label="Title"
            variant="filled"
            value={input.title}
            required
            onChange={(e) => {
              console.log("title : ", e.target.value)
              setInput({...input, title:e.target.value})
            }}
          />
          <DatePicker
            label="วันที่-เวลา เริ่มขายหวย"
            placeholderText="วันที่-เวลา เริ่มขายหวย"
            required={true}
            selected={input.start_date_time}
            onChange={(date) => {
              setInput({...input, start_date_time:date})
            }}
            timeInputLabel="Time:"
            dateFormat="MM/dd/yyyy h:mm aa"
            showTimeInput/>
          <DatePicker
            label="วันที่-เวลา สิ้นสุดขายหวย"
            placeholderText="วันที่-เวลา สิ้นสุดขายหวย"
            required={true}
            selected={input.end_date_time}
            onChange={(date) => {
              setInput({...input, end_date_time: date})
            }}
            timeInputLabel="Time:"
            dateFormat="MM/dd/yyyy h:mm aa"
            showTimeInput/>
          <TextField
            id="filled-basic"
            title="bon"
            label="ผลการออกรางวัล บน"
            variant="filled"
            value={input.bon}
            onChange={(e) => {
              setInput({...input, bon:e.target.value})
            }}
          />
          <TextField
            id="filled-basic"
            title="lang"
            label="ผลการออกรางวัล ล่าง"
            variant="filled"
            type="number"
            value={input.lang}
            onChange={(e) => {
              setInput({...input, lang:e.target.value})
            }}
          />

          {
            <Button 
              variant="contained" 
              color="primary"
              // disabled={input.title === "" || input.start_date_time === null || input.end_date_time === null || input.bon === "" || input.lang === null }
              onClick={(evt)=>{ onExpire() }}>{t("Set expire")}</Button>
          } 
          {
            mode == "edit" 
            ? <Button 
                variant="contained" 
                color="primary"
                disabled={input.title === "" || input.start_date_time === null || input.end_date_time === null || input.bon === "" || input.lang === null }
                onClick={(evt)=>{ onCalculate() }}>{t("calculate")}</Button>
            : <div />
          }
         
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={input.title === "" || input.start_date_time === null || input.end_date_time === null}
            onClick={(evt)=>submitForm(evt)}>{t("save")}</Button>
          </Stack>
        </Box>
      }
      </div>
  );
};

export default ManageLotteryPage;