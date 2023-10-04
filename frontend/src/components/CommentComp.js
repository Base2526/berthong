import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { LinearProgress } from '@mui/material';
import _ from "lodash"
import { useLocation } from "react-router-dom";

import { queryCommentById, subscriptionCommentById } from "../apollo/gqlQuery"
import { CommentSection } from "./comment";
import { getHeaders, handlerErrorApollo } from "../util"

let unsubscribeCommentById = null;
const CommentComp = (props) => {
    const location = useLocation();
    let { user, id, onLogin, onMutationComment } = props 

    const [data, setData] = useState([])
    
    const signinUrl = "/signin";
    const signupUrl = "/signup";

    const { loading: loadingCommentById, 
            data: dataCommentById, 
            error: errorCommentById, 
            refetch: refetchCommentById,
            subscribeToMore: subscribeToMoreCommentById, 
            networkStatus } = useQuery(queryCommentById, 
                                        { 
                                            context: { headers: getHeaders(location) }, 
                                            fetchPolicy: 'cache-first',
                                            nextFetchPolicy: 'network-only', 
                                            notifyOnNetworkStatusChange: true
                                        }
                                    );

    if(!_.isEmpty(errorCommentById)) handlerErrorApollo( props, errorCommentById )

    useEffect(()=>{
        if(!_.isEmpty(id)){
          refetchCommentById({id})

          unsubscribeCommentById && unsubscribeCommentById()
          unsubscribeCommentById = null;

          unsubscribeCommentById =  subscribeToMoreCommentById({
              document: subscriptionCommentById,
              variables: { id },
              updateQuery: (prev, {subscriptionData}) => {
                if (!subscriptionData.data) return prev;

                let { mutation, commentId, data } = subscriptionData?.data?.subscriptionCommentById;
                switch(mutation){
                  case "CREATED":
                  case "UPDATED":{
                      return {commentById: {...prev.commentById, data}}; 
                  }
                  default:
                      return prev;
                }
              }
          });
        }  
    }, [id])

    useEffect(() => {
      if(!loadingCommentById){
        if(!_.isEmpty(dataCommentById?.commentById)){
          let { status, data } = dataCommentById?.commentById
          if(status){
            setData(data)
          }
        }
      }
    }, [dataCommentById, loadingCommentById])

    return (
      <> 
        { 
            loadingCommentById
            ?  <LinearProgress />
            :  <CommentSection
                {...props}
                currentUser={
                    _.isEmpty(user)  
                    ? null
                    : { userId: _.isEmpty(user) ? "" : user?._id, 
                        avatarUrl: _.isEmpty(user) ? "" : user?.avatar?.url, 
                        name: _.isEmpty(user) ? "" : user?.displayName }
                }
                commentsArray={ _.isEmpty(data?.data) ? [] : data?.data}
                setComment={(data) => {
                    let input = { _id: id, data: _.omitDeep(data, ['__typename']) }

                    onMutationComment(input)
                }}
                signinUrl={signinUrl}
                signupUrl={signupUrl}
                onSignin={(e)=> onLogin(true) }/>
        }
      </>
    )
};

export default CommentComp;
