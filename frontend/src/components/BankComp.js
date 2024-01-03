import React, { useState, useEffect, useMemo } from "react";
import _ from "lodash"
import { useQuery } from "@apollo/client";
import { useNavigate, useLocation } from "react-router-dom";
import { 
    LinearProgress,
    Autocomplete,
    TextField
} from "@mui/material";
import { useTranslation } from "react-i18next";

import { queryBankByIds } from "../apollo/gqlQuery"
import { getHeaders, handlerErrorApollo } from "../util"

const BankComp = (props) => {
    const { t }    = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    let [data, setData] = useState();
    
    let { banks, onChange} = props

    const { loading: loadingBankByIds, 
            data: dataBankByIds, 
            error: errorBankByIds,
            refetch: refetchBankByIds,} = useQuery(queryBankByIds, { 
                                                                context: { headers: getHeaders(location) },
                                                                // variables: {id: userId},
                                                                fetchPolicy: 'cache-first', 
                                                                nextFetchPolicy: 'network-only', 
                                                                notifyOnNetworkStatusChange: true 
                                                            });

    if(!_.isEmpty(errorBankByIds)) handlerErrorApollo( props, errorBankByIds )

    useEffect(()=>{
        let bankIds = _.map(banks, (bank)=>bank.bankId)
        if(!_.isEmpty(bankIds)){
            refetchBankByIds({ids: bankIds});
        }
    }, [banks])

    useEffect(() => {
        if(!loadingBankByIds){
            if (dataBankByIds?.bankByIds) {
                let { status, data } = dataBankByIds?.bankByIds
                if(status){
                   let n =  _.map(banks, (bank)=>{
                        let v = _.find(data, d => d._id === bank.bankId)
                        if(v){
                            return {...bank, ...v}
                        }
                    })
                    setData(n)
                }
            }
        }
    }, [dataBankByIds, loadingBankByIds])

    return  useMemo(() => {
                return  <div >
                            {   loadingBankByIds && _.isEmpty(data)
                                ?   <LinearProgress /> 
                                :   <Autocomplete
                                        label={"เลือกบัญชี *"}
                                        disablePortal
                                        id="bank"
                                        sx={{ width: 300 }}
                                        options={ data }
                                        getOptionLabel={(option)=>`${option.bankNumber} (${option.name})`}
                                        renderInput={(params) =><TextField {...params} label={t("bank_account_name")} /> }
                                        onChange={(event, val) => onChange(event, val) }/>
                            }
                        </div>
            }, [banks, data]);
};

export default BankComp;
