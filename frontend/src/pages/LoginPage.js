import React , {useState, useEffect} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation, useApolloClient } from "@apollo/client";
import { useDeviceData } from "react-device-detect";
import _ from "lodash";
import AccountCircle from "@material-ui/icons/AccountCircle";
import LockIcon from '@mui/icons-material/Lock';

import { mutationLogin } from "../apollo/gqlQuery"
import { setCookie, getHeaders } from "../util"

const LoginPage = (props) => {
    let navigate = useNavigate();
    let deviceData = useDeviceData();
    let location = useLocation();
    let client = useApolloClient();

    let { user, updateProfile } = props

    if(!_.isEmpty(user)){
        navigate("/me")
    }

    let [input, setInput]   = useState({ username: "",  password: ""});
    const [onLogin, resultLogin] = useMutation(mutationLogin, { 
        context: { headers: getHeaders(location) },
        onCompleted: async(datas)=>{
            console.log("onCompleted :", datas)
            let {status, data, sessionId} = datas.login
            if(status){
                // localStorage.setItem('usida', sessionId)
                setCookie('usida', sessionId)
                updateProfile(data)
            }

            navigate("/")
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
}

export default LoginPage