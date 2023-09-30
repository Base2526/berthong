import React, { useEffect, useState } from "react";
import IconButton from "@mui/material/IconButton";
import { useQuery } from "@apollo/client";
import ShareIcon from "@mui/icons-material/Share";
import _ from "lodash"
import {
    Button,
    Box,
    Stack,
    Avatar,
    LinearProgress
  } from '@mui/material';
import { useLocation } from "react-router-dom";

import * as Constants from "../constants"
import { getHeaders } from "../util"
import { queryUserById } from "../apollo/gqlQuery"

const AdminDepositItem = (props) => {
    const location = useLocation();

    let [data, setData] = useState()

    let { _id, userId, balance, onMutationAdminDeposit} = props

    const { loading: loadingUserById, 
            data: dataUserById, 
            error: errorUserById,
            networkStatus,
            refetch: refetchUserById } = useQuery(queryUserById, 
                                            { 
                                            context: { headers: getHeaders(location) }, 
                                            fetchPolicy: 'cache-first', 
                                            nextFetchPolicy: 'network-only', 
                                            notifyOnNetworkStatusChange: true
                                            }
                                        )

    useEffect(()=>{
        if(userId){
            refetchUserById({id : userId});
        }
    }, [userId])

    useEffect(()=>{
        if( !loadingUserById ){
          if(!_.isEmpty(dataUserById?.userById)){
            let { status, data } = dataUserById.userById
            if(status){
                setData(data)
            }
          }
        }
    }, [dataUserById, loadingUserById])
  
    return    <div style={{flex:1}}>
                {
                    loadingUserById
                    ? <LinearProgress />
                    : <Stack direction="row" spacing={2} >
                        <Box>Deposit</Box>
                        <Box>
                        <Avatar 
                            sx={{ width: 40, height: 40 }} 
                            src= { _.isEmpty(data?.avatar) ? "" :  data?.avatar?.url ? data?.avatar?.url : URL.createObjectURL(data?.avatar) }
                            variant="rounded" />
                        </Box>
                        <Box>{data?.displayName}</Box>
                        <Box>{balance}</Box>
                        <Button 
                            size="small" 
                            variant="contained"
                            onClick={(evt)=>{
                                onMutationAdminDeposit({ variables: {input: { _id, status: Constants.APPROVED } } });
                            }}>APPROVED</Button>
                        <Button 
                            size="small" 
                            variant="outlined" 
                            color="error"
                            onClick={(evt)=>{
                                onMutationAdminDeposit({ variables: {input: { _id, status: Constants.REJECT } } });
                            }}>REJECT</Button>
                    </Stack>
                }
                </div> 

};

export default AdminDepositItem;
