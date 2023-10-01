import React , {useEffect, useState} from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@apollo/client";
import CircularProgress from '@mui/material/CircularProgress';
import _ from "lodash";

import { getHeaders } from "../util";
import { queryBankById } from "../apollo/gqlQuery"

let editValues = undefined;
let initValues =  { mode: "NEW",  name : "",  description: "" }

const TaxonomyBankPage = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  let [input, setInput] = useState(initValues)
  let [data, setData] = useState(initValues)
  const { mode, _id } = location.state

  let { onMutationBank } = props

  const { loading: loadingBankById, 
          data: dataBankById, 
          error: errorBankById,
          refetch: refetchBankById} = useQuery(queryBankById, {
                                    context: { headers: getHeaders(location) }, 
                                    fetchPolicy: 'network-only', // Used for first execution
                                    nextFetchPolicy: 'cache-first', // Used for subsequent executions
                                    notifyOnNetworkStatusChange: true,
                                  });

  useEffect(()=>{
    if(mode == "edit" && _id){
      refetchBankById({id: _id});
    }
  }, [_id])

  useEffect(()=>{
    if(mode == "edit"){
      if (dataBankById) {
        let { status, data } = dataBankById.bankById
        if(status){
          setData(data)
        }
      }
    }
  }, [dataBankById])

  switch(mode){
    case "new":{
      editValues = undefined
      break;
    }

    case "edit":{
      // editValues = useQuery(queryBankById, {
      //   variables: {id: _id},
      //   notifyOnNetworkStatusChange: true,
      // });
     
      // console.log("editValues : ", editValues, input)

      // if(_.isEqual(input, initValues)) {
      //   if(!_.isEmpty(editValues)){
      //     let {loading}  = editValues
          
      //     if(!loading){
      //       let {status, data} = editValues.data.bankById
      //       if(status){
      //         setInput({
      //           name: data.name,
      //           description: data.description
      //         })
      //       }
      //     }
      //   }
      // }

      if(!loadingBankById){
        setInput({ name: data.name, description: data.description })
      }
      break;
    }
  }

  const submitForm = (event) => {
    event.preventDefault();
    let newInput = { mode: mode.toUpperCase(),  name: input.name, description: input.description }
    if(mode == "edit"){
      newInput = {...newInput, _id: editValues.data.bankById.data._id}
    }
    onMutationBank({ variables: { input: newInput } })
  };

  return (
    <div>
      {
        editValues != null && editValues.loading
        ?<CircularProgress />
        :<Box component="form" sx={{ "& .MuiTextField-root": { m: 1, width: "50ch" } }} onSubmit={submitForm} >
            <TextField
              id="filled-basic"
              name="name"
              label="Name"
              variant="filled"
              value={input.name}
              required
              onChange={(e) => {
                console.log("name : ", e.target.value)
                setInput({...input, name:e.target.value})
              }}
            />
            {/* <Editor 
              name="description" 
              label={"Description"}  
              initData={input.description}
              onEditorChange={(newValue)=>{
                setInput({...input, description:newValue})
              }}/> */}

            <Button type="submit" variant="contained" color="primary">{mode === 'new' ? "CREATE" : "UPDATE"} </Button>
          </Box>
      }
    </div>
  );
};

export default TaxonomyBankPage;