import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import { styled } from "@mui/material/styles";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import _ from "lodash"
import { useQuery } from "@apollo/client";
import { IconButton, Avatar } from "@mui/material";

import { getHeaders } from "./util"
import { queryUserById } from "./gqlQuery"

const Input = styled("input")({ display: "none" });

let initValues =  {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  displayName: "",
  avatar: null,
  roles: []
}

const UserPage = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { user } = props
  let [input, setInput]       = useState(initValues);
  let [error, setError]       = useState(initValues);
  
  const { mode, id } = location.state
  const { loading: loadingUserById, 
          data: dataUserById, 
          error: errorUserById,
          refetch: refetchUserById } = useQuery(queryUserById, { 
                                                              context: { headers: getHeaders(location) },
                                                              fetchPolicy:'cache-first', // Used for first execution
                                                              nextFetchPolicy:'network-only', // Used for subsequent executions
                                                              notifyOnNetworkStatusChange: true 
                                                            });

  // const [onMutationMe, resultMutationMe] = useMutation(mutationMe, {
  //   context: { headers: getHeaders(location) },
  //   update: (cache, {data: {me}}) => {
  //     let { data, status } = me

  //     let queryUsersValue = cache.readQuery({ query: queryUsers });
  //     if(!_.isEmpty(queryUsersValue)){
  //       let newData = _.map(queryUsersValue.users.data, (item)=> item._id == data._id ? data : item )     
  //       cache.writeQuery({
  //         query: queryUsers,
  //         data: { users: {...queryUsersValue.users, data: newData} }
  //       });
  //     }
      
  //     ////////// update cache queryUserById ///////////
  //     let queryUserByIdValue = cache.readQuery({ query: queryUserById, variables: {id: data._id}});
  //     if(queryUserByIdValue){
  //       cache.writeQuery({
  //         query: queryUserById,
  //         data: { userById: {...queryUserByIdValue.userById, data} },
  //         variables: {id: data._id}
  //       });
  //     }
  //     ////////// update cache queryUserById ///////////    
  //   },
  //   onCompleted({ data }) {
  //     switch(checkRole(user)){
  //       case AMDINISTRATOR:{
  //         // history.push("/users")
  //         navigate("/users")
  //         break
  //       }

  //       case AUTHENTICATED:{
  //         // history.goBack()
  //         navigate(-1)
  //         break;
  //       }
  //     }
  //   },
  //   onError({error}){
  //     console.log("onError :")
  //   }
  // });

  useEffect(()=>{
    if(mode == "edit" && id){
      refetchUserById({id});
    }
  }, [id])

  useEffect(()=>{
    if( !loadingUserById && mode == "edit"){
      if(!_.isEmpty(dataUserById?.userById)){
        let { status, data } = dataUserById.userById
        if(status){
          setInput({
            username: data.username,
            displayName: data.displayName,
            email: data.email,
            avatar: data.avatar,
            roles: data.roles,
            isActive: data.isActive,
          })
        }
      }
    }
  }, [dataUserById, loadingUserById])

  const submitForm = async(event) => {
    event.preventDefault();
    
    console.log("input :", input)
    /*
    switch(checkRole(user)){
      case AMDINISTRATOR:{
        let newInput = {
          uid: id,
          displayName: input.username,
          email: input.email,
          password: input.password,
          isActive: input.isActive,
          avatar: input.avatar
        }

        if(mode == "edit"){
          newInput = {...newInput, _id: id}
        }
    
        onMutationMe({ variables: { input: newInput }});
        break;
      }

      case AUTHENTICATED:{
        let newInput = {
          displayName: input.username,
          email: input.email,
          password: input.password,
          image: input.image
        }
    
        onMutationMe({ variables: { input: newInput }});
        break;
      }
    }
    */
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

  return (<form onSubmit={submitForm} >
            <div className="Mui-dblockavatar">
              <label>Profile</label>
              <div direction="row" spacing={2} className="Mui-wrapsrcimg">
                <Avatar
                  className={"user-profile"}
                  sx={{ height: 80, width: 80 }}
                  variant="rounded"
                  alt="Example Alt"
                  src={ !_.isEmpty(input?.avatar?.type) ? URL.createObjectURL(input?.avatar) :  input?.avatar?.url ? input?.avatar?.url : "" }
                />
                <label htmlFor="profile">
                  <Input
                    accept="image/*"
                    id="profile"
                    name="file"
                    type="file"
                    onChange={(event) => setInput({...input, avatar: event.target?.files[0]}) }/>
                  <IconButton
                    color="primary"
                    aria-label="upload picture"
                    component="span">
                    <PhotoCamera />
                  </IconButton>
                </label>
              </div>
            </div>
            <div>
              <label>ชื่อแสดง * :</label>
              <input 
                type="text" 
                name="displayName"
                value={ _.isEmpty(input.displayName) ? "" : input.displayName }
                onChange={ onInputChange }
                onBlur={ validateInput } />
              <p className="text-red-500"> {_.isEmpty(error.displayName) ? "" : error.displayName} </p>
            </div>
            <div>
              <label>ชื่อ * :</label>
              <input 
                type="text" 
                name="username"
                disabled={true}
                value={ _.isEmpty(input.username) ? "" : input.username }
                onChange={ onInputChange }
                onBlur={ validateInput } />
              <p className="text-red-500"> {_.isEmpty(error.username) ? "" : error.username} </p>
            </div>
            <div>
              <label>Email * :</label>
              <input 
                type="text" 
                name="email"
                disabled={true}
                value={ _.isEmpty(input.email) ? "" : input.email }
                onChange={ onInputChange }
                onBlur={ validateInput } />
              <p className="text-red-500"> {_.isEmpty(error.email) ? "" : error.email} </p>
            </div>
            <div>
              <label>Password * :</label>
              <input 
                type="password" 
                name="password"
                value={ _.isEmpty(input.password) ? "" : input.password }
                onChange={ onInputChange }
                onBlur={ validateInput } />
              <p className="text-red-500"> {_.isEmpty(error.password) ? "" : error.password} </p>
            </div>
            <div>
              <label>Confirm password * :</label>
              <input 
                type="password" 
                name="confirmPassword"
                value={ _.isEmpty(input.confirmPassword) ? "" : input.confirmPassword }
                onChange={ onInputChange }
                onBlur={ validateInput } />
              <p className="text-red-500"> {_.isEmpty(error.confirmPassword) ? "" : error.confirmPassword} </p>
            </div>
            <button type="submit"> {t("update")} </button>
          </form>);
}

const mapStateToProps = (state, ownProps) => {
  return {user: state.auth.user}
}

const mapDispatchToProps = {}
export default connect( mapStateToProps, mapDispatchToProps )(UserPage);