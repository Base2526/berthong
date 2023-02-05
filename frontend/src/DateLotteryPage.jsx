import React , {useState} from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useHistory, useLocation } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import CircularProgress from '@mui/material/CircularProgress';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import Editor from "./editor/Editor";
import { mutationDateLottery, queryDateLotteryById, queryDateLotterys } from "./gqlQuery"
import _ from "lodash";

let editValues = undefined;
let initValues =  { mode: "NEW",  title : "", startDate: null, endDate: null, description: "" }

const DateLotteryPage = (props) => {
  let location = useLocation();
  let history = useHistory();

  const [input, setInput] = useState(initValues)

  let { mode, _id } = location.state

  console.log("mode, id :", mode, _id)

  const [onMutationDateLottery, resultMutationDateLotteryValues] = useMutation(mutationDateLottery
    , {
        update: (cache, {data: {dateLottery}}) => {

          console.log("DateLottery :", dateLottery)
          
          ////////// udpate cache Banks ///////////
          let queryDateLotterysValue = cache.readQuery({ query: queryDateLotterys });
          let { status, mode, data } = dateLottery
          if(status && queryDateLotterysValue){
            switch(mode){
              case "new":{
                cache.writeQuery({
                  query: queryDateLotterys,
                  data: { dateLotterys: {...queryDateLotterysValue.dateLotterys, data: [...queryDateLotterysValue.dateLotterys.data, data]} },
                });
                break;
              }

              case "edit":{
                let newData = _.map(queryDateLotterysValue.dateLotterys.data, (item)=>item._id.toString() == data._id.toString() ?  data : item ) 
                cache.writeQuery({
                  query: queryDateLotterys,
                  data: { dateLotterys: {...queryDateLotterysValue.dateLotterys, data: newData} },
                });
                break;
              }
            }
          }
          ////////// udpate cache Banks ///////////
        

          ////////// update cache queryDateLotteryById ///////////
          let dateLotteryByIdValue = cache.readQuery({ query: queryDateLotteryById, variables: {id: data._id}});
          if(status && dateLotteryByIdValue){
            cache.writeQuery({
              query: queryDateLotteryById,
              data: { dateLotteryById: {...dateLotteryByIdValue.dateLotteryById, data} },
              variables: {id: data._id}
            });
          }
          ////////// update cache queryDateLotteryById ///////////

        },
        onCompleted({ data }) {
          history.goBack();
        },
        onError({error}){
          console.log("error :", error)
        }
      }
  );

  console.log("resultMutationDateLotteryValues :", resultMutationDateLotteryValues)

  switch(mode){
    case "new":{
      editValues = undefined
      break;
    }

    case "edit":{
      editValues = useQuery(queryDateLotteryById, {
        variables: {id: _id},
        notifyOnNetworkStatusChange: true,
      });
     
      console.log("editValues : ", editValues, input)

      if(_.isEqual(input, initValues)) {
        if(!_.isEmpty(editValues)){
          let {loading}  = editValues
          
          if(!loading){
            let {status, data} = editValues.data.dateLotteryById

            if(status){
              setInput({
                title: data.title,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                description: data.description
              })
            }
          }
        }
      }
      break;
    }
  }

  const submitForm = (event) => {
    event.preventDefault();
    // startDate: null, endDate: null
    let newInput = {  mode: mode.toUpperCase(), 
                      title: input.title, 
                      startDate: input.startDate,
                      endDate: input.endDate,
                      description: input.description }
    if(mode == "edit"){
      newInput = {...newInput, _id: editValues.data.dateLotteryById.data._id}
    }

    onMutationDateLottery({ variables: { input: newInput } })
  };

  return (
    <div>
      {
        editValues != null && editValues.loading
        ?<CircularProgress />
        :<Box component="form" sx={{ "& .MuiTextField-root": { m: 1, width: "50ch" } }} onSubmit={submitForm} >
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
              label="Start date"
              placeholderText="Start date"
              required={true}
              selected={input.startDate}
              onChange={(date) => {
                setInput({...input, startDate: date})
              }}
              timeInputLabel="Time:"
              dateFormat="MM/dd/yyyy h:mm aa"
              showTimeInput/>

            <DatePicker
              label="End date"
              placeholderText="End date"
              required={true}
              selected={input.endDate}
              onChange={(date) => {
                setInput({...input, endDate: date})
              }}
              timeInputLabel="Time:"
              dateFormat="MM/dd/yyyy h:mm aa"
              showTimeInput/>

            <Editor 
              name="description" 
              label={"Description"}  
              initData={input.description}
              onEditorChange={(newValue)=>{
                setInput({...input, description:newValue})
              }}/>

            <Button type="submit" variant="contained" color="primary">{mode === 'new' ? "CREATE" : "UPDATE"} </Button>
          </Box>
      }
      </div>
  );
};

export default DateLotteryPage;