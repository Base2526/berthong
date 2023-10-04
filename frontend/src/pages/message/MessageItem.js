import React, { useEffect } from "react";
import _ from "lodash"
import moment from "moment";
import { useQuery } from "@apollo/client";
import { useLocation } from "react-router-dom";
import styles from "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import { Message, Avatar } from "@chatscope/chat-ui-kit-react";
import LinearProgress from '@mui/material/LinearProgress';

import { queryUserById } from "../../apollo/gqlQuery"
import { getHeaders, handlerErrorApollo } from "../../util";

const MessageItem = (props) => {
    let location = useLocation();
    let {user, item} = props 
    let {type, message, sentTime, senderId, senderName, position, payload} = item

    const { loading: loadingUserById, 
            data: dataUserById, 
            error: errorUserById, 
            refetch: refetchUserById,
            networkStatus }   =   useQuery(queryUserById, 
                                    { 
                                        context: { headers: getHeaders(location) }, 
                                        variables: {id: senderId}, 
                                        fetchPolicy: 'cache-first', 
                                        nextFetchPolicy: 'network-only', 
                                        notifyOnNetworkStatusChange: true
                                    });  

    if(errorUserById) return handlerErrorApollo( props, errorUserById );

    useEffect(()=>{
        if(!_.isEmpty(senderId)) refetchUserById({id: senderId})
    }, [senderId])

    let direction = senderId == user._id  ? "outgoing" : "incoming"
    
    switch(type){
        case "text":{
        switch(direction){
            case "incoming":{
                return  <Message
                            type={type}
                            model={{
                                message,
                                sentTime,
                                sender: senderName,
                                direction,
                                position
                            }}>
                             { loadingUserById ? <LinearProgress sx={{width:"100px"}} /> : <Avatar src={_.isEmpty(dataUserById?.userById?.data?.avatar) ? "" : dataUserById?.userById?.data?.avatar?.url} name="Zoe" size="sm" /> }
                            <Message.Footer sentTime={moment.unix(sentTime/1000).format('hh:mm A')} />
                        </Message>
            }

            case "outgoing":{
            return  <Message
                        type={type}
                        model={{
                        message,
                        sentTime,
                        sender: senderName,
                        direction,
                        position
                        }}
                    >
                        <Message.Footer sentTime={moment.unix(sentTime/1000).format('hh:mm A')} />
                    </Message>
            }
        }

        break;
        }

        case "html":{
        switch(direction){
            case "incoming":{
            return <Message model={{
                        type,
                        direction,
                        position
                    }}>
                        
                        <Message.HtmlContent html={message} />
                        { loadingUserById ? <LinearProgress sx={{width:"100px"}} /> : <Avatar src={_.isEmpty(dataUserById?.userById?.data?.avatar) ? "" : dataUserById?.userById?.data?.avatar?.url} name="Zoe" size="sm" /> }
                        <Message.Footer sentTime={moment.unix(sentTime/1000).format('hh:mm A')} />
                    </Message>

            }

            case "outgoing":{
            return  <Message model={{
                        type,
                        direction,
                        position
                    }}>
                        <Message.HtmlContent html={message} />
                        <Message.Footer sentTime={moment.unix(sentTime/1000).format('hh:mm A')} />
                    </Message>
            }
        }

        break;
        }

        case "image":{
            let { src } = payload[0]
            switch(direction){
                case "incoming":{
                    return  <Message model={{direction, position}}>
                                { loadingUserById ? <LinearProgress sx={{width:"100px"}} /> : <Avatar src={_.isEmpty(dataUserById?.userById?.data?.avatar) ? "" : dataUserById?.userById?.data?.avatar?.url} name="Zoe" size="sm" /> }
                                <Message.ImageContent className={"message-image"} src={src} alt={"alt"} width={150} onClick={(event)=>{ console.log("event")}} />
                                <Message.Footer sentTime={moment.unix(sentTime/1000).format('hh:mm A')} />   
                            </Message>
                }

                case "outgoing":{
                    return  <Message model={{direction, position}}>
                                <Message.ImageContent className={"message-image"} src={src} alt={"alt"} width={150} onClick={(event)=>{ console.log("event")}} />
                                <Message.Footer sentTime={moment.unix(sentTime/1000).format('hh:mm A')} />  
                            </Message>
                }
            }

        break;
        }
    } 
};

export default MessageItem;