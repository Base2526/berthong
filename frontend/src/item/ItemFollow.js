import { useMutation } from "@apollo/client";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import IconButton from "@mui/material/IconButton";
import _ from "lodash";
import React from "react";
import { useLocation } from "react-router-dom";

import { UNAUTHENTICATED } from "../constants";
import { mutationFollow, querySupplierById, querySuppliers } from "../gqlQuery";
import { getHeaders, showToast } from "../util";

const ItemFollow = (props) => {
  let location = useLocation();
  
  let { user, item, onDialogLogin } = props 

  const [onMutationFollow, resultMutationFollowValue] = useMutation(mutationFollow,{
    context: { headers: getHeaders(location) },
    update: (cache, {data: {follow}}) => {
      let { data, status } = follow
      if(status){
        let querySuppliersValue = cache.readQuery({ query: querySuppliers });
        if(!_.isEmpty(querySuppliersValue)){
          let newData = _.map(querySuppliersValue.suppliers.data, (item)=> item._id == data._id ? data : item ) 
          cache.writeQuery({
            query: querySuppliers,
            data: { suppliers: {...querySuppliersValue.suppliers, data: newData} }
          });
        }

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
    onCompleted(data) {
      console.log("onCompleted")
    },
    onError: (err) => {
      _.map(err?.graphQLErrors, (e)=>{
        switch(e?.extensions?.code){
          case UNAUTHENTICATED:{
            showToast("error", e?.message)
            break;
          }
        }
      })
    }
  });

  let isFollow = _.find(item.follows, (fl)=>fl.userId == user._id)
  let color = !_.isEmpty(isFollow) ? "blue" : "";
  
  return  <IconButton onClick={(e) =>{ _.isEmpty(user) ? onDialogLogin() : onMutationFollow({ variables: { id: item._id } }) }}> 
            <BookmarkIcon style={{ color }} />
          </IconButton>

};

export default ItemFollow;