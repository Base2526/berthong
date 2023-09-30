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

const AdminWithdrawsItem = (props) => {
    const location = useLocation();

    let [user, setUser] = useState()

    let { _id, userId, balance, onMutationAdminWithdraw} = props

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
                setUser(data)
            }
          }
        }
    }, [dataUserById, loadingUserById])

    //   let {user, index,  item, onOpenMenuShare} = props 
    //   useEffect(()=>{
    //     return () => {
    //       unsubscribe && unsubscribe()
    //     };
    //   }, [])

    // const handleClick = (e) =>{
    //   _.isEmpty(user)
    //   ? onDialogLogin(true)
    //   : onAnchorElShareOpen(index, e);
    // }

    // let shareValues = useQuery(gqlShareByPostId, {
    //   context: { headers: getHeaders() }, 
    //   variables: {postId: item._id},
    //   notifyOnNetworkStatusChange: true,
    // });

    // // console.log("shareValues :", shareValues)

    // if(!shareValues.loading){

    //   let {subscribeToMore} = shareValues
    //   unsubscribe =  subscribeToMore({
    //     document: subShare,
    //     variables: { postId: item._id },
    //     updateQuery: (prev, {subscriptionData}) => {
    //       if (!subscriptionData.data) return prev;

    //       let { mutation, data } = subscriptionData.data.subShare;
    //       let newPrev = {...prev.shareByPostId, data:_.uniqBy([...prev.shareByPostId.data, data], 'id')}  
    //       return {shareByPostId: newPrev}; 
    //     }
    //   });


    //   if( _.isEmpty(shareValues.data) || shareValues.data.shareByPostId.data.length == 0){
    //     return <IconButton onClick={(e) => handleClick(e)}>
    //               <ShareIcon />
    //             </IconButton> 
    //   }

    //   return  <IconButton onClick={(e) => handleClick(e)}>
    //             <ShareIcon />
    //             <div style={{
    //                 position: "absolute",
    //                 right: "5px",
    //                 borderRadius: "5px",
    //                 borderStyle: "solid",
    //                 borderColor: "red",
    //                 borderWidth: "1px",
    //                 fontSize: "10px"
    //             }}>{shareValues.data.shareByPostId.data.length}</div>
    //           </IconButton>
    // }
  
    return    <div style={{flex:1}}>
                {
                    loadingUserById
                    ? <LinearProgress />
                    : <Stack direction="row" spacing={2} >
                        <Box>Withdraw</Box>
                        <Box>
                        <Avatar 
                            sx={{ width: 40, height: 40 }} 
                            src= { _.isEmpty(user?.avatar) ? "" :  user?.avatar?.url ? user?.avatar?.url : URL.createObjectURL(user?.avatar) }
                            variant="rounded" />
                        </Box>
                        <Box>{user?.displayName}</Box>
                        <Box>{balance}</Box>
                        <Button 
                            size="small" 
                            variant="contained"
                            onClick={(evt)=>{
                                onMutationAdminWithdraw({ variables: {input: { _id, status: Constants.APPROVED } } });
                            }}>APPROVED</Button>
                        <Button 
                            size="small" 
                            variant="outlined" 
                            color="error"
                            onClick={(evt)=>{
                                onMutationAdminWithdraw({ variables: {input: { _id, status: Constants.REJECT } } });
                            }}>REJECT</Button>
                    </Stack>
                }
                </div> 

};

export default AdminWithdrawsItem;
