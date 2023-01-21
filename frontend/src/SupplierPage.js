import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import { ToastContainer, toast } from 'react-toastify';
import CircularProgress from '@mui/material/CircularProgress';
import 'react-toastify/dist/ReactToastify.css';
import _ from "lodash"
import { useQuery, useMutation } from "@apollo/client";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";

import { getHeaders } from "./util"
import { gqlSupplier, gqlSupplierById } from "./gqlQuery"

import Editor from "./editor/Editor";
import AttackFileField from "./AttackFileField";

let initValues = {
  title: "", 
  price: "", 
  priceUnit: "",
  description: "",
  dateLottery: null,
  attackFiles: [] 
}

const SupplierPage = (props) => {
  let history = useHistory();
  const location = useLocation();
  const { t } = useTranslation();

  const [snackbar, setSnackbar] = useState({open:false, message:""});
  const [input, setInput]       = useState(initValues);
  const [error, setError]       = useState(initValues);

  console.log("location :", location.state )

  let { mode, id } = location.state

  let editValues = null;

  useEffect(()=>{
    console.log("input :", input)
  }, [input])

  const [onSupplier, resultSupplier] = useMutation(gqlSupplier, {
    context: { headers: getHeaders() },
    update: (cache, {data: {supplier}}) => {

      console.log("supplier :", supplier)
        // const data1 = cache.readQuery({
        // query: gqlPosts,
        // variables: {
        //     userId: _.isEmpty(user) ? "" : user._id,
        //     page: 0, 
        //     perPage: 30
        // }
        // });

        // console.log("onCreatePost data1:", data1)

        // if(data1 != null){ 
        // let newPosts = {...data1.posts}
        // let newData = [...newPosts.data, createPost]

        // cache.writeQuery({
        //     query: gqlPosts,
        //     data: { posts: {...newPosts, data: newData} },
        //     variables: {
        //     userId: _.isEmpty(user) ? "" : user._id,
        //     page: 0, 
        //     perPage: 30
        //     }
        // });
        // }
    },
    onCompleted({ data }) {
      history.push("/suppliers")
    },
    onError({error}){
      console.log("onError :")
    }
  });
  console.log("resultSupplier :", resultSupplier)

  const submitForm = async(event) => {
    event.preventDefault();

    let newInput =  {
        mode: mode.toUpperCase(),
        _id: mode == "new" ? "" : editValues.data.getSupplierById.data._id,
        title: input.title,
        price: parseInt(input.price),
        priceUnit: parseInt(input.priceUnit),
        description: input.description,
        dateLottery: input.dateLottery,
        files: input.attackFiles
    }

    // console.log("submitForm :", newInput)
    onSupplier({ variables: { input: newInput } });
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
        case "title": {
          if (!value) {
            stateObj[name] = "Please enter title.";
          }
          break;
        }

        case "price": {
          if (!value) {
            stateObj[name] = "Please enter price.";
          }
          break;
        }

        case "priceUnit": {
          if (!value) {
            stateObj[name] = "Please enter price unit.";
          } 

          break;
        }

        default:
          break;
      }

      return stateObj;
    });
  };

  switch(mode){
    case "new":{
        return <LocalizationProvider dateAdapter={AdapterDateFns} >
                <Box
                    component="form"
                    sx={{
                        "& .MuiTextField-root": { m: 1, width: "50ch" }
                    }}
                    onSubmit={submitForm}>
                    <div >
                        <TextField
                            id="title"
                            name="title"
                            label={"ชื่อ"}
                            variant="filled"
                            required
                            value={input.title}
                            onChange={onInputChange}
                            onBlur={validateInput}
                            helperText={error.title}
                            error={_.isEmpty(error.title) ? false : true}/>
                        <TextField
                            id="price"
                            name="price"
                            label={"ราคาสินค้า"}
                            variant="filled"
                            type="number"
                            required
                            value={ _.isEmpty(input.price) ? "" : input.price}
                            onChange={onInputChange}
                            onBlur={validateInput}
                            helperText={ _.isEmpty(error.price) ? "" : error.price }
                            error={_.isEmpty(error.price) ? false : true}/>
                        <TextField
                            id="price-unit"
                            name="priceUnit"
                            label={"ขายเบอละ"}
                            variant="filled"
                            type="number"
                            required
                            value={_.isEmpty(input.priceUnit) ? "" : input.priceUnit }
                            onChange={onInputChange}
                            onBlur={validateInput}
                            helperText={_.isEmpty(error.priceUnit) ? "" : error.priceUnit}
                            error={_.isEmpty(error.priceUnit) ? false : true}/>
                        <DesktopDatePicker
                            label={"ออกงวดวันที่"}
                            inputFormat="dd/MM/yyyy"
                            value={ input.dateLottery }
                            onChange={(newDate) => {
                                setInput({...input, dateLottery: newDate})
                            }}
                            renderInput={(params) => <TextField {...params} required={input.dateLottery === null ? true: false} />}/>
                        <Editor 
                            label={t("detail")} 
                            initData={ input.description }
                            onEditorChange={(newDescription)=>{
                                setInput({...input, description: newDescription})
                            }}/>
                        <AttackFileField
                            label={t("attack_file")}
                            values={input.attackFiles}
                            onChange={(values) => {
                                console.log("AttackFileField :", values)
                                setInput({...input, attackFiles: values})
                            }}
                            onSnackbar={(data) => {
                                setSnackbar(data);
                            }}/>

                    </div>
                    <Button type="submit" variant="contained" color="primary">
                        {t("create")}
                    </Button>
                </Box>
               </LocalizationProvider>
    }

    case "edit":{
      editValues = useQuery(gqlSupplierById, {
                        context: { headers: getHeaders() },
                        variables: {id},
                        notifyOnNetworkStatusChange: true,
                      });

      console.log("editValues :", editValues)

      if(_.isEqual(input, initValues)) {
        if(!_.isEmpty(editValues)){
          let {loading}  = editValues
          
          if(!loading){
            let {status, data} = editValues.data.getSupplierById

            console.log("edit editValues : ", data)
            if(status){
              setInput({
                title: data.title, 
                price: data.price, 
                priceUnit: data.priceUnit, 
                description: data.description, 
                dateLottery: data.dateLottery, 
                attackFiles: data.files, 
              })
            }
          }
        }
      }

      return  editValues != null && editValues.loading
                ? <div><CircularProgress /></div> 
                : <LocalizationProvider dateAdapter={AdapterDateFns} >
                  <Box
                      component="form"
                      sx={{
                          "& .MuiTextField-root": { m: 1, width: "50ch" }
                      }}
                      onSubmit={submitForm}>
                      <div >
                          <TextField
                              id="title"
                              name="title"
                              label={"ชื่อ"}
                              variant="filled"
                              required
                              value={input.title}
                              onChange={onInputChange}
                              onBlur={validateInput}
                              helperText={error.title}
                              error={_.isEmpty(error.title) ? false : true}/>
                          <TextField
                              id="price"
                              name="price"
                              label={"ราคาสินค้า"}
                              variant="filled"
                              type="number"
                              required
                              value={ input.price }
                              onChange={onInputChange}
                              onBlur={validateInput}
                              helperText={ error.price }
                              error={_.isEmpty(error.price) ? false : true}/>
                          <TextField
                              id="price-unit"
                              name="priceUnit"
                              label={"ขายเบอละ"}
                              variant="filled"
                              type="number"
                              required
                              value={ input.priceUnit }
                              onChange={onInputChange}
                              onBlur={validateInput}
                              helperText={ error.priceUnit }
                              error={_.isEmpty(error.priceUnit) ? false : true}/>
                          <DesktopDatePicker
                              label={"ออกงวดวันที่"}
                              inputFormat="dd/MM/yyyy"
                              value={ input.dateLottery }
                              onChange={(newDate) => {
                                  setInput({...input, dateLottery: newDate})
                              }}
                              renderInput={(params) => <TextField {...params} required={input.dateLottery === null ? true: false} />}/>
                          <Editor 
                              label={t("detail")} 
                              initData={ input.description }
                              onEditorChange={(newDescription)=>{
                                  setInput({...input, description: newDescription})
                              }}/>
                          <AttackFileField
                              label={t("attack_file")}
                              values={input.attackFiles}
                              onChange={(values) => {
                                  console.log("AttackFileField :", values)
                                  setInput({...input, attackFiles: values})
                              }}
                              onSnackbar={(data) => {
                                  setSnackbar(data);
                              }}/>

                      </div>
                      <Button type="submit" variant="contained" color="primary">
                          {t("update")}
                      </Button>
                  </Box>
                </LocalizationProvider>
    }
  }

  return (<div style={{flex:1}}>SupplierPage : {mode}</div>);
}

const mapStateToProps = (state, ownProps) => {
    return {user: state.auth.user}
}

const mapDispatchToProps = {}

export default connect( mapStateToProps, mapDispatchToProps )(SupplierPage);