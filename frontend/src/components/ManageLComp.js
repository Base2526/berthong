import React, { useState, useEffect, useMemo } from "react";
import { LinearProgress } from "@material-ui/core";
import _ from "lodash"
import { useQuery } from "@apollo/client";
import { useNavigate, useLocation, createSearchParams } from "react-router-dom";
import { Avatar } from "@mui/material"

import { queryManageLotterys } from "../apollo/gqlQuery"
import { getHeaders, handlerErrorApollo } from "../util"

const ManageLComp = (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    let [data, setData] = useState();
    
    let { _id } = props

    let {   loading: loadingManageLotterys, 
            data: dataManageLotterys, 
            error: errorManageLotterys } = useQuery(queryManageLotterys, 
                                                { 
                                                    context: { headers: getHeaders(location) },
                                                    fetchPolicy: 'cache-first', 
                                                    nextFetchPolicy: 'network-only', 
                                                    notifyOnNetworkStatusChange: true 
                                                }
                                                );

    if(!_.isEmpty(errorManageLotterys)){
        handlerErrorApollo( props, errorManageLotterys )
    }

    useEffect(() => {
        if(!loadingManageLotterys){
            if (dataManageLotterys?.manageLotterys) {
                let { status, data } = dataManageLotterys?.manageLotterys
                if(status){
                    setData(data)
                }
            }
        }
    }, [dataManageLotterys, loadingManageLotterys])

    const view = () =>{
        let ch = _.find(data, m=> m?._id === _id )
        return _.isEmpty(ch) ?  <div>-</div> : <div>{ch?.title}</div>
    }

    return  useMemo(() => {
                return  <div 
                            // onClick={()=>{
                            //     navigate({ pathname: `/p`, search: `?${createSearchParams({ id: userId })}` })
                            // }}
                            >
                            {   loadingManageLotterys 
                                ? <LinearProgress /> 
                                : <div>{ view() }</div>  
                            }
                        </div>
            }, [_id, data]);
};

export default ManageLComp;
