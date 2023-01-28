import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import { styled } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import Autocomplete from "@mui/material/Autocomplete";
import InputAdornment from "@mui/material/InputAdornment";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

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
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LinearProgress from '@mui/material/LinearProgress';

import { getHeaders } from "./util"
import { queryRoles, queryUserById, mutationMe } from "./gqlQuery"

import Editor from "./editor/Editor";
import AttackFileField from "./AttackFileField";

const Input = styled("input")({
  display: "none"
});

let initValues =  {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  image: undefined,
  roles: [],
  isActive: false
}

const UserPage = (props) => {
  let history = useHistory();
  let location = useLocation();
  let { t } = useTranslation();

  let [snackbar, setSnackbar] = useState({open:false, message:""});
  let [input, setInput]       = useState(initValues);
  let [error, setError]       = useState(initValues);
  

  const [showPassword, setShowPassword] = useState(false);
  const [showCofirmPassword, setShowCofirmPassword] = useState(false);
  const [image, setImage] = useState(null);

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = () => setShowPassword(!showPassword);

  const handleClickShowCofirmPassword = () =>
    setShowCofirmPassword(!showCofirmPassword);
  const handleMouseDownCofirmPassword = () =>
    setShowCofirmPassword(!showCofirmPassword);

  console.log("location :", location.state )

  let { mode, id } = location.state

  let editValues = null;

  const rolesValue = useQuery(queryRoles, { notifyOnNetworkStatusChange: true });

  
  const [onMutationMe, resultMutationMe] = useMutation(mutationMe, {
    context: { headers: getHeaders() },
    update: (cache, {data: {me}}) => {

      console.log("me :", me)

      /*
      let { data, mode, status } = supplier

      if(status){
        switch(mode){
          case "new":{
            const data1 = cache.readQuery({ query: gqlSuppliers });
            let newData = [...data1.getSuppliers.data, supplier.data];//_.map(data1.getSuppliers.data, (item)=> item._id == supplier.data._id ? supplier.data : item ) 

            cache.writeQuery({
              query: gqlSuppliers,
              data: { getSuppliers: {...data1.getSuppliers, data: newData} }
            });
            break;
          }

          case "edit":{
            const data1 = cache.readQuery({ query: gqlSuppliers });
            let newData = _.map(data1.getSuppliers.data, (item)=> item._id == supplier.data._id ? supplier.data : item ) 

            cache.writeQuery({
              query: gqlSuppliers,
              data: { getSuppliers: {...data1.getSuppliers, data: newData} }
            });
            
            break;
          }
        }
      }
      */
    },
    onCompleted({ data }) {
      history.push("/users")
    },
    onError({error}){
      console.log("onError :")
    }
  });
  console.log("resultMutationMe :", resultMutationMe)
  
  const rolesView = () =>{
    let value = _.filter(rolesValue.data.roles.data, v => input.roles.includes(v._id))
    
    return  <Autocomplete
              multiple
              id="user-roles"
              name="userRoles"
              options={ rolesValue.data.roles.data }
              getOptionLabel={(option) => {
                return option.name
              }}
              value={ value }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="User roles"
                  placeholder="role"
                  required={ input.roles.length === 0 ? true : false }
                />
              )}
              onChange={(event, roles)=>{
                setInput({...input, roles:_.map(roles, v=>v._id)})
              }}
            />
  }

  const isActiveView = () =>{

    let optionsIsactive = [
      { name: "Active", id: "active" },
      { name: "Unactive", id: "unactive" }
    ]

    let value = undefined
    if(input.isActive === undefined) {
      value = optionsIsactive[1]
    }else{
      value = _.find(optionsIsactive, v=> v.id === input.isActive )
    }

    return  <Autocomplete
              id="user-isactive"
              name="isActive"
              options={optionsIsactive}
              getOptionLabel={(option) => option.name}
              value={value}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Unactive"
                  placeholder="Unactive"
                  required={ input.isActive === undefined ? true : false }
                />
              )}
              onChange={(event, value)=>{
                setInput({...input, isActive: value.id})
              }}
            />
  }

  const submitForm = async(event) => {
    event.preventDefault();

    // let newInput =  {
    //     mode: mode.toUpperCase(),
    //     title: input.title,
    //     price: parseInt(input.price),
    //     priceUnit: parseInt(input.priceUnit),
    //     description: input.description,
    //     dateLottery: input.dateLottery,
    //     files: input.attackFiles
    // }

    // if(mode == "edit"){
    //   newInput = {...newInput, _id: editValues.data.getSupplierById.data._id}
    // }

    // // console.log("submitForm :", newInput)
    // onSupplier({ variables: { input: newInput } });

    let newInput = {
      username: input.username,
      email: input.email,
      password: input.password,
      roles: input.roles,
      isActive: input.isActive,
    }

    if(image !== null){
      newInput = {...newInput, image}
    }

    console.log("newInput :", newInput)

    onMutationMe({ variables: { input: newInput }});
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
        case "username": {
          if (!value) {
            stateObj[name] = "Please enter Username.";
          }
          break;
        }

        case "email": {
          if (!value) {
            stateObj[name] = "Please enter Email.";
          }
          break;
        }

        case "password": {
          if (!value) {
            stateObj[name] = "Please enter Password.";
          } else if (input.confirmPassword && value !== input.confirmPassword) {
            stateObj["confirmPassword"] =
              "Password and Confirm Password does not match.";
          } else {
            stateObj["confirmPassword"] = input.confirmPassword
              ? ""
              : error.confirmPassword;
          }
          break;
        }

        case "confirmPassword": {
          if (!value) {
            stateObj[name] = "Please enter Confirm Password.";
          } else if (input.password && value !== input.password) {
            stateObj[name] = "Password and Confirm Password does not match.";
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
                <Box component="form" sx={{ "& .MuiTextField-root": { m: 1, width: "50ch" } }} onSubmit={submitForm}>
                  <div>
                    <Typography variant="overline" display="block" gutterBottom>
                      Profile
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      <Avatar
                        className={"user-profile"}
                        sx={{
                          height: 80,
                          width: 80
                        }}
                        variant="rounded"
                        alt="Example Alt"
                        src={input.image == undefined ? "" : input.image.base64 ? input.image.base64: URL.createObjectURL(input.image)}
                      />
                    </Stack>
                    <label htmlFor="profile">
                      <Input
                        accept="image/*"
                        id="profile"
                        name="file"
                        // multiple
                        type="file"
                        onChange={(e) => {
                          setInput({...input, image:e.target.files[0]})
                        }}
                      />
                      <IconButton
                        color="primary"
                        aria-label="upload picture"
                        component="span"
                      >
                        <PhotoCamera />
                      </IconButton>
                    </label>
                  </div>
                  <TextField
                    id="user-username"
                    name="username"
                    label="Username"
                    variant="filled"
                    required
                    value={input.username}
                    onChange={(e)=>{
                      setInput({...input, username:e.target.value})
                    }}
                    onBlur={validateInput}
                    // helperText={_.isEmpty(error.username)? "Input username" : error.username}
                    helperText={error.username}
                    error={_.isEmpty(error.username) ? false : true}
                  />
                  <TextField
                    id="user-email"
                    name="email"
                    label="Email"
                    variant="filled"
                    required
                    value={input.email}
                    onChange={(e)=>{
                      setInput({...input, email:e.target.value})
                    }}
                    onBlur={validateInput}
                    helperText={error.email}
                    error={_.isEmpty(error.email) ? false : true}
                  />
                  <TextField
                    id="user-password"
                    name="password"
                    label="Password"
                    variant="filled"
                    type={showPassword ? "text" : "password"} // <-- This is where the magic happens
                    required
                    value={input.password}
                    onChange={(e)=>{
                      setInput({...input, password:e.target.value})
                    }}
                    onBlur={validateInput}
                    helperText={error.password}
                    error={_.isEmpty(error.password) ? false : true}
                    InputProps={{
                      // <-- This is where the toggle button is added.
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                          >
                            {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                  <TextField
                    id="filled-basic"
                    name="confirmPassword"
                    label="Confirm password"
                    variant="filled"
                    type={showCofirmPassword ? "text" : "password"}
                    required
                    value={input.confirmPassword}
                    onChange={(e)=>{
                      setInput({...input, confirmPassword:e.target.value})
                    }}
                    onBlur={validateInput}
                    helperText={error.confirmPassword}
                    error={_.isEmpty(error.confirmPassword) ? false : true}
                    InputProps={{
                      // <-- This is where the toggle button is added.
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowCofirmPassword}
                            onMouseDown={handleMouseDownCofirmPassword}
                          >
                            {showCofirmPassword ? (
                              <VisibilityIcon />
                            ) : (
                              <VisibilityOffIcon />
                            )}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                  {
                    rolesValue.loading
                    ? <LinearProgress sx={{width:"100px"}} /> 
                    : rolesView()
                  }
                  {
                    isActiveView()
                  }
                  <Button type="submit" variant="contained" color="primary">
                    {t("create")}
                  </Button>
                </Box>
               </LocalizationProvider>
    }

    case "edit":{
      editValues = useQuery(queryUserById, {
                        context: { headers: getHeaders() },
                        variables: {id},
                        notifyOnNetworkStatusChange: true,
                      });

      if(_.isEqual(input, initValues)) {
        if(!_.isEmpty(editValues)){
          let {loading}  = editValues
          
          if(!loading){
            let {status, data} = editValues.data.userById
            if(status){
              setInput({
                username: data.username,
                email: data.email,
                image: _.isEmpty(data.image) ? undefined : data.image[0] ,
                roles: data.roles,
                isActive: data.isActive
              })
            }
          }
        }
      }
      
      return  editValues != null && editValues.loading
                ? <div><CircularProgress /></div> 
                : <LocalizationProvider dateAdapter={AdapterDateFns} >
                    <Box component="form" sx={{ "& .MuiTextField-root": { m: 1, width: "50ch" } }}  onSubmit={submitForm} >
                      <div className="Mui-dblockavatar">
                        <Typography variant="overline" display="block" gutterBottom>
                          Profile
                        </Typography>
                        <Stack direction="row" spacing={2} className="Mui-wrapsrcimg">
                          <Avatar
                            className={"user-profile"}
                            sx={{
                              height: 80,
                              width: 80
                            }}
                            variant="rounded"
                            alt="Example Alt"
                            // src={input.profile == undefined ? "" : input.profile.url ? input.profile.url: URL.createObjectURL(input.profile)}
                          
                            src={ image != null ? URL.createObjectURL(image) :  input.profile?.url ? input.profile.url : "" }
                          />

                          <label htmlFor="profile">
                            <Input
                              accept="image/*"
                              id="profile"
                              name="file"
                              // multiple
                              type="file"
                              onChange={(event) => {
                                setImage(event.target.files[0])
                              }}
                            />
                            <IconButton
                              color="primary"
                              aria-label="upload picture"
                              component="span"
                            >
                              <PhotoCamera />
                            </IconButton>
                          </label>
                        </Stack>
                        
                      </div>
                      <TextField
                        id="user-username"
                        name="username"
                        label="Username"
                        variant="filled"
                        required
                        value={input.username}
                        onChange={(e)=>{
                          setInput({...input, username:e.target.value})
                        }}
                        onBlur={validateInput}
                        // helperText={_.isEmpty(error.username)? "Input username" : error.username}
                        helperText={error.username}
                        error={_.isEmpty(error.username) ? false : true}
                      />
                      <TextField
                        id="user-email"
                        name="email"
                        label="Email"
                        variant="filled"
                        required
                        value={input.email}
                        onChange={(e)=>{
                          setInput({...input, email:e.target.value})
                        }}
                        onBlur={validateInput}
                        helperText={error.email}
                        error={_.isEmpty(error.email) ? false : true}
                      />
                      <TextField
                        id="user-password"
                        name="password"
                        label="Password"
                        variant="filled"
                        type={showPassword ? "text" : "password"} // <-- This is where the magic happens
                        // required
                        value={input.password}
                        onChange={(e)=>{
                          setInput({...input, password:e.target.value})
                        }}
                        onBlur={validateInput}
                        helperText={error.password}
                        error={_.isEmpty(error.password) ? false : true}
                        InputProps={{
                          // <-- This is where the toggle button is added.
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                              >
                                {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                      <TextField
                        id="filled-basic"
                        name="confirmPassword"
                        label="Confirm password"
                        variant="filled"
                        type={showCofirmPassword ? "text" : "password"}
                        // required
                        value={input.confirmPassword}
                        onChange={(e)=>{
                          setInput({...input, confirmPassword:e.target.value})
                        }}
                        onBlur={validateInput}
                        helperText={error.confirmPassword}
                        error={_.isEmpty(error.confirmPassword) ? false : true}
                        InputProps={{
                          // <-- This is where the toggle button is added.
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowCofirmPassword}
                                onMouseDown={handleMouseDownCofirmPassword}
                              >
                                {showCofirmPassword ? (
                                  <VisibilityIcon />
                                ) : (
                                  <VisibilityOffIcon />
                                )}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                      
                      {
                        rolesValue.loading
                        ? <LinearProgress sx={{width:"100px"}} /> 
                        : rolesView()
                      }

                      {
                        isActiveView()
                      } 
                      <Button type="submit" variant="contained" color="primary"> {t("update")} </Button>
                    </Box>
                  </LocalizationProvider>
    }
  }

  return (<div style={{flex:1}}>UserPage : {mode}</div>);
}

const mapStateToProps = (state, ownProps) => {
  return {user: state.auth.user}
}

const mapDispatchToProps = {}

export default connect( mapStateToProps, mapDispatchToProps )(UserPage);