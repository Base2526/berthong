import React, { useState, useEffect } from "react";
import { LinearProgress } from "@material-ui/core";
import _ from "lodash"
import { useQuery } from "@apollo/client";
import { useNavigate, useLocation, createSearchParams } from "react-router-dom";

import { queryUserById } from "../gqlQuery"
import { getHeaders } from "../util"

const UserComp = (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    let [data, setData] = useState();
    
    let { userId } = props

    const { loading: loadingUserById, 
            data: dataUserById, 
            error: errorUserById} = useQuery(queryUserById, { 
                                                                context: { headers: getHeaders(location) },
                                                                variables: {id: userId},
                                                                fetchPolicy: 'cache-first', // Used for first execution
                                                                nextFetchPolicy: 'network-only', // Used for subsequent executions
                                                                notifyOnNetworkStatusChange: true 
                                                            });
    useEffect(() => {
        if(!loadingUserById){
            if (dataUserById?.userById) {
                let { status, data } = dataUserById?.userById
                if(status){
                    setData(data)
                }
            }
        }
    }, [dataUserById, loadingUserById])

    return  <div 
                onClick={()=>{
                    navigate({ pathname: `/p`, search: `?${createSearchParams({ id: userId })}` })
                }}>
                { loadingUserById ? <LinearProgress /> : data?.displayName }
            </div>
};

export default UserComp;
