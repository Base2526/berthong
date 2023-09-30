import React, { useState, useEffect, useMemo } from "react";
import { LinearProgress } from "@material-ui/core";
import _ from "lodash"
import { useQuery } from "@apollo/client";
import { useNavigate, useLocation, createSearchParams } from "react-router-dom";
import { Avatar } from "@mui/material"

import { queryUserById } from "../apollo/gqlQuery"
import { getHeaders, handlerErrorApollo } from "../util"

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
                                                                fetchPolicy: 'cache-first', 
                                                                nextFetchPolicy: 'network-only', 
                                                                notifyOnNetworkStatusChange: true 
                                                            });

    if(!_.isEmpty(errorUserById)) return handlerErrorApollo( props, errorUserById )

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

    return  useMemo(() => {
                return  <div 
                            onClick={()=>{
                                navigate({ pathname: `/p`, search: `?${createSearchParams({ id: userId })}` })
                            }}>
                            {   loadingUserById 
                                ? <LinearProgress /> 
                                : <div>
                                    <Avatar
                                        alt="Example avatar"
                                        variant="rounded"
                                        src={data?.avatar?.url}
                                        onClick={(e) => {
                                            // onLightbox({ isOpen: true, photoIndex: 0, images:files })
                                        }}
                                        sx={{ width: 56, height: 56 }}
                                    />
                                    <>{data?.displayName}</>
                                </div>  }
                        </div>
            }, [userId, data]);
};

export default UserComp;
