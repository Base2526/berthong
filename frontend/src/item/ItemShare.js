import React, { useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import { useQuery } from "@apollo/client";
import ShareIcon from "@mui/icons-material/Share";
import _ from "lodash"
import { getHeaders } from "../util"

let unsubscribe =  null
const ItemShare = (props) => {
  let {user, index,  item, onOpenMenuShare} = props 

  useEffect(()=>{
    return () => {
      unsubscribe && unsubscribe()
    };
  }, [])

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
  
  return  <IconButton onClick={onOpenMenuShare}>
            <ShareIcon />
          </IconButton> 

};

export default ItemShare;
