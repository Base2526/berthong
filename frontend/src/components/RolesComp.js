import React, { useState, useEffect } from "react";
import { LinearProgress } from "@material-ui/core";
import _ from "lodash"
import { useQuery } from "@apollo/client";
import { useNavigate, useLocation, createSearchParams } from "react-router-dom";

import { queryRoleByIds } from "../apollo/gqlQuery"
import { getHeaders, handlerErrorApollo } from "../util"

const RolesComp = (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    let [data, setData] = useState();
    
    let { Ids } = props

    const { loading: loadingRoleByIds, 
            data: dataRoleByIds, 
            error: errorRoleByIds} = useQuery(queryRoleByIds, { 
                                                                context: { headers: getHeaders(location) },
                                                                variables: {input: Ids},
                                                                fetchPolicy: 'cache-first', // Used for first execution
                                                                nextFetchPolicy: 'network-only', // Used for subsequent executions
                                                                notifyOnNetworkStatusChange: true 
                                                            });
    if(!_.isEmpty(errorRoleByIds)) return handlerErrorApollo( props, errorRoleByIds )

    useEffect(() => {
        if(!loadingRoleByIds){
            if (dataRoleByIds?.roleByIds) {
                let { status, data } = dataRoleByIds?.roleByIds
                if(status){
                    setData(data)
                }
            }
        }
    }, [dataRoleByIds, loadingRoleByIds])

    return  <div>{ loadingRoleByIds ? <LinearProgress /> : _.map(data, e=>e.name).join(', ') }</div>
};

export default RolesComp;
