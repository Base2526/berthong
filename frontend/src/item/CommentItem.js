import React, { useEffect, useState } from "react";
import { IconButton, Badge } from "@mui/material";
import { AiOutlineComment } from "react-icons/ai"
import _ from "lodash"
import { createSearchParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@apollo/client";

import { queryCommentById } from "../apollo/gqlQuery"
import { getHeaders } from "../util"

// let unsubscribe =  null
const CommentItem = (props) => {
    let  navigate = useNavigate();
    const location = useLocation();
    let { item } = props 

    let [data, setData] = useState([]);

    // console.log("item :", item)

    const { loading: loadingCommentById, 
            data: dataCommentById, 
            error: errorCommentById, 
            refetch: refetchCommentById,
            networkStatus } = useQuery( queryCommentById, { 
                                        context: { headers: getHeaders(location) }, 
                                        fetchPolicy: 'cache-only', 
                                        nextFetchPolicy: 'network-only', 
                                        notifyOnNetworkStatusChange: true});

    console.log("errorCommentById :", errorCommentById)
    
    useEffect(()=>{
        refetchCommentById({id: item?._id});
    }, [item?._id])

    useEffect(() => {
        if(!loadingCommentById){
            if (dataCommentById?.commentById) {
                let { status, data } = dataCommentById?.commentById
                if(status && !_.isEmpty(data)){
                    setData(data?.data)
                }
            }
        }
    }, [dataCommentById, loadingCommentById])

    const countComments = (data) =>{
        let arr_objCount = data?.length;
        _.map(data, (v, i)=>{
            arr_objCount+=v?.replies.length
        })

        return arr_objCount
    }
    
    return      loadingCommentById 
                ?   <IconButton onClick={()=>{
                            navigate({
                                pathname: "/d",
                                search: `?${createSearchParams({ id: item._id})}`,
                                state: { id: item._id }
                            })
                        }}> 
                        <AiOutlineComment />
                    </IconButton>
                :   <IconButton onClick={()=>{
                            navigate({
                                pathname: "/d",
                                search: `?${createSearchParams({ id: item._id})}`,
                                state: { id: item._id }
                            })
                        }}> 
                        <Badge badgeContent={ data?.length == 0 ? 0 : countComments(data) } color="primary">
                            <AiOutlineComment />
                        </Badge>
                    </IconButton>
};

export default CommentItem;
