import React, { useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import { useMutation } from "@apollo/client";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import _ from "lodash"
import { connect } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";

import { mutationFollow, querySupplierById } from "./gqlQuery"
import { getHeaders } from "./util"

let unsubscribe =null
const ItemFollow = (props) => {
  let location = useLocation();
  
  let { user, item, onDialogLogin } = props 

  const [onMutationFollow, resultMutationFollowValue] = useMutation(mutationFollow,{
    context: { headers: getHeaders(location) },
    update: (cache, {data: {follow}}) => {
      
      // console.log("follow :", follow)

      let { data, status } = follow

      if(status){
        // let queryHomesValue = cache.readQuery({ query: queryHomes });
        // if(!_.isEmpty(queryHomesValue)){
        //   let newData = _.map(queryHomesValue.homes.data, (item)=> item._id == data._id ? data : item ) 
          
        //   cache.writeQuery({
        //     query: queryHomes,
        //     data: { homes: {...queryHomesValue.homes, data: newData} }
        //   });
        // }

        let querySupplierByIdValue = cache.readQuery({ query: querySupplierById, variables: { id: data._id  } });
        if(!_.isEmpty(querySupplierByIdValue)){
          let newData = {...querySupplierByIdValue.supplierById}
          cache.writeQuery({
            query: querySupplierById,
            data: { supplierById: {...newData, data} },
            variables: { id: data._id }
          }); 
        }
      }
    },
    onCompleted({ data }) {
      console.log("onCompleted")
    },
    onError: (err) => {
      console.log("onError :", err)
    }
  });

  let isFollow = _.find(item.follows, (fl)=>fl.userId == user._id)
  let color = !_.isEmpty(isFollow) ? "blue" : "";
  
  return  <IconButton onClick={(e) =>{ _.isEmpty(user) ? onDialogLogin() : onMutationFollow({ variables: { id: item._id } }) }}> 
            <BookmarkIcon style={{ color }} />
          </IconButton>

};

export default ItemFollow;