import React , {useState, useEffect} from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useHistory, useParams } from "react-router-dom";
import { useQuery, useMutation, useApolloClient } from "@apollo/client";
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import { useDeviceData } from "react-device-detect";
import Typography from "@material-ui/core/Typography";
import { connect } from "react-redux";
import _ from "lodash";
import axios from "axios";
import GitHubIcon from '@mui/icons-material/GitHub';
import AccountCircle from "@material-ui/icons/AccountCircle";
import LockIcon from '@mui/icons-material/Lock';
import utf8 from "utf8";
import base64 from 'base-64';

import { login } from "./redux/actions/auth"

import { mutationLogin } from "./gqlQuery"

const LoginPage = (props) => {
    let history = useHistory();
    let deviceData = useDeviceData();
    let client = useApolloClient();

    let { user, login } = props

    // console.log("user :", user)

    if(!_.isEmpty(user)){
        history.push("/me");
    }

    let [input, setInput]   = useState({ username: "",  password: ""});
    const [onLogin, resultLogin] = useMutation(mutationLogin, {
        // refetchQueries: [ {query: gqlPosts}, {query : gqlHomes} ],     
        onCompleted: async(datas)=>{
            console.log("onCompleted :", datas)
            let {status, data, sessionId} = datas.login
            if(status){
                localStorage.setItem('token', sessionId)
                login(data)
            }

            // await client.cache.reset();
            // await client.resetStore();

            history.push("/");
        },
        onError(err){
          console.log("onError :", err)
        }
    });

    if(resultLogin.called && !resultLogin.loading){
        console.log("resultLogin :", resultLogin)
    }

    const onInputChange = (e) => {
        const { name, value } = e.target;
        setInput((prev) => ({
          ...prev,
          [name]: value
        }));
    };

    const handleSubmit = (event) =>{
        event.preventDefault();    

        console.log("handleSubmit")
        onLogin({ variables: { input: { username: input.username,  password: input.password, deviceAgent: JSON.stringify(deviceData) }} })
    }

    return (<div className="page-userlog pl-2 pr-2">
                <div className="Mui-usercontainerss">
                    <form onSubmit={handleSubmit}>
                        <div className="d-flex form-input">
                            <label>Username </label>
                            <div className="position-relative wrapper-form">
                                <input type="text" name="username" className="input-bl-form" value={input.username} onChange={onInputChange} required />
                                <AccountCircle />
                            </div>
                        </div>
                        <div className="d-flex form-input">
                            <label>Password </label>
                            <div className="position-relative wrapper-form">
                                <input type="password" name="password" className="input-bl-form" value={input.password} onChange={onInputChange} required />
                                <LockIcon/>
                            </div>
                        </div>
                        <button type="submit">Login</button>    
                    </form>
                </div>
            </div> );
};

const mapStateToProps = (state, ownProps) => {
    return { user:state.auth.user }
};

const mapDispatchToProps = { login }
  
export default connect( mapStateToProps, mapDispatchToProps )(LoginPage);  