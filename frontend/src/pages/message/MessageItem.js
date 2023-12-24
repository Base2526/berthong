import React, { useEffect, useState } from "react";
import _ from "lodash"
import moment from "moment";
import { useQuery } from "@apollo/client";
import { useLocation } from "react-router-dom";
import styles from "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
// import { MessageSeparator, Message, Avatar } from "@chatscope/chat-ui-kit-react";
import LinearProgress from '@mui/material/LinearProgress';

import {
    MainContainer,
    ChatContainer,
    MessageList,
    Message,
    MessageInput,
    Avatar,
    AvatarGroup,
    Button,
    Conversation,
    ConversationHeader,
    StarButton,
    VoiceCallButton,
    VideoCallButton,
    InfoButton,
    ConversationList,
    InputToolbox,
    Loader,
    TypingIndicator,
    StatusList,
    Status,
    Sidebar,
    Search,
    MessageSeparator,
    action,
    ExpansionPanel,
    MessageGroup
  } from "@chatscope/chat-ui-kit-react";

import { FiShoppingCart as zoeIco } from "react-icons/fi"

import { queryUserById } from "../../apollo/gqlQuery"
import { getHeaders, handlerErrorApollo } from "../../util";

const MessageItem = (props) => {
    let location = useLocation();
    let {user, item} = props 
    let {type, message, sentTime, senderId, senderName, position, payload} = item

    let [currentUser, setCurrentUser] = useState()
    let direction = senderId == user._id  ? "outgoing" : "incoming"

    console.log("MessageItem :", currentUser, item)

    let loadingUserById = false
    // const { loading: loadingUserById, 
    //         data: dataUserById, 
    //         error: errorUserById, 
    //         refetch: refetchUserById,
    //         networkStatus }   =   useQuery(queryUserById, 
    //                                 { 
    //                                     context: { headers: getHeaders(location) }, 
    //                                     // variables: {id: senderId}, 
    //                                     fetchPolicy: 'cache-first', 
    //                                     nextFetchPolicy: 'network-only', 
    //                                     notifyOnNetworkStatusChange: true
    //                                 });  

    // if(errorUserById){
    //     handlerErrorApollo( props, errorUserById );
    // } 

    // useEffect(()=>{
    //     if(!loadingUserById){
    //       if(!_.isEmpty(dataUserById?.userById)){
    //         let { status, data } = dataUserById?.userById
    //         if(status) setCurrentUser(data)
    //       }
    //     }
    // }, [dataUserById, loadingUserById])

    // useEffect(()=>{
    //     if(!_.isEmpty(senderId) && direction === "incoming") refetchUserById({id: senderId})
    // }, [senderId])

    switch(type){
        case "text":{
            switch(direction){
                case "incoming":{
                    return  <Message
                                type={type}
                                model={{ message, sentTime, sender: senderName, direction, position }}>
                                { loadingUserById 
                                    ? <LinearProgress sx={{width:"100px"}} /> 
                                    : <Avatar src={_.isEmpty(currentUser?.avatar) ? "" : currentUser?.avatar?.url} name="Zoe" size="sm" /> }
                                <Message.Footer sentTime={moment.unix(sentTime/1000).format('hh:mm A')} />
                            </Message>
                }

                case "outgoing":{
                    // return <Message model={{
                    //             message: "Hello my friend",
                    //             sentTime: "15 mins ago",
                    //             sender: "Zoe"
                    //         }} />
                return  <Message
                            type={type}
                            model={{ message, sentTime, sender: senderName, direction, position }}>
                            <Message.Footer sentTime={moment.unix(sentTime/1000).format('hh:mm A')} />
                        </Message>
                }
            }

            break;
        }

        case "html":{
            switch(direction){
                case "incoming":{
                return <Message model={{ type, direction, position }}>
                            <Message.HtmlContent html={message} />
                            {   loadingUserById 
                                ? <LinearProgress sx={{width:"100px"}} /> 
                                : <Avatar src={_.isEmpty(currentUser?.avatar) ? "" : currentUser?.avatar?.url} name="Zoe" size="sm" /> }
                            <Message.Footer sentTime={moment.unix(sentTime/1000).format('hh:mm A')} />
                        </Message>

                }

                case "outgoing":{
                return  <Message model={{ type, direction, position }}>
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
                                {   loadingUserById 
                                    ? <LinearProgress sx={{width:"100px"}} /> 
                                    : <Avatar src={_.isEmpty(currentUser?.avatar) ? "" : currentUser?.avatar?.url} name="Zoe" size="sm" /> }
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

    return <MessageSeparator content="Saturday, 30 November 2019" />
};

export default MessageItem;