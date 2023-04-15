import React, { useState, useEffect } from "react";
import { LinearProgress } from "@material-ui/core";
import _ from "lodash"
import { useQuery } from "@apollo/client";
import { useNavigate, useLocation, createSearchParams } from "react-router-dom";

import { queryBankById } from "../gqlQuery"
import { getHeaders, handlerErrorApollo } from "../util"

const BankComp = (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    let [data, setData] = useState();
    let { bankId } = props

    const { loading: loadingBankById, 
            data: dataBankById, 
            error: errorBankById} = useQuery(queryBankById, { 
                                                                context: { headers: getHeaders(location) },
                                                                variables: { id: bankId },
                                                                fetchPolicy: 'cache-first', // Used for first execution
                                                                nextFetchPolicy: 'network-only', // Used for subsequent executions
                                                                notifyOnNetworkStatusChange: true 
                                                            });
    if(!_.isEmpty(errorBankById)){
        return handlerErrorApollo( props, errorBankById )
    }

    useEffect(() => {
        if(!loadingBankById){
            if (dataBankById?.bankById) {
                let { status, data } = dataBankById?.bankById
                if(status){
                    setData(data)
                }
            }
        }
    }, [dataBankById, loadingBankById])

    return  <div>{ loadingBankById ? <LinearProgress /> : data?.name }</div>
};

export default BankComp;
