import "./messenger.css";
import React, { useState, useEffect, useRef } from "react";
import styles from "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
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
import LinearProgress from '@mui/material/LinearProgress';
import _ from "lodash"
import { useQuery, useMutation } from "@apollo/client";
import moment from "moment";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import mongoose from "mongoose";

import {
  FiShoppingCart as zoeIco
} from "react-icons/fi"

import { queryMessage, mutationMessage, subMessage, gqlUpdateMessageRead, queryConversations} from "../../apollo/gqlQuery"
import MessageItem from "./MessageItem"
import { getHeaders, truncate, handlerErrorApollo } from "../../util"

let unsubscribeSubMessage = null
const MessagePage = (props) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, conversations } = props;

 
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadedMessages, setLoadedMessages] = useState([]);
  const [counter, setCounter] = useState(0);

  const onYReachStart = () => {
    if (loadingMore === true) {
      return;
    }

    setLoadingMore(true);
    /* Fake fetch from API */

    setTimeout(() => {
      const messages = [];
      /* Add 10 messages */

      const maxCounter = counter + 10;
      let i = counter;

      for (; i < maxCounter; i++) {
        messages.push(<Message key={i} model={{
          message: `Message ${i}`,
          sender: "Zoe"
        }} />);
      }

      setLoadedMessages(messages.reverse().concat(loadedMessages));
      setCounter(i);
      setLoadingMore(false);
    }, 1500);
  };

  return  <div style={{ height: "500px", overflow: "hidden" }}>
            <MessageList loadingMore={loadingMore} onYReachStart={onYReachStart}>
              <MessageSeparator content="Saturday, 30 November 2019" />
                    
                    {loadedMessages}
                  
                    <MessageGroup direction="incoming">          
                      <Avatar src={zoeIco} name={"Zoe"} />          
                      <MessageGroup.Messages>
                        <Message model={{
                          message: "Hello my friend",
                          sentTime: "15 mins ago",
                          sender: "Zoe"
                        }} />
                      </MessageGroup.Messages>              
                    </MessageGroup>
                    
                    <MessageGroup direction="outgoing">
                      <MessageGroup.Messages>
                        <Message model={{
                  message: "Hello my friend",
                  sentTime: "15 mins ago",
                  sender: "Akane"
                }} />
                      </MessageGroup.Messages>
                    </MessageGroup>
                    
                    <MessageGroup>
                      <Avatar src={zoeIco} name={"Zoe"} />
                      <MessageGroup.Messages direction="incoming">
                        <Message model={{
                  message: "Hello my friend",
                  sentTime: "15 mins ago",
                  sender: "Zoe"
                }} />
                        <Message model={{
                  message: "Hello my friend",
                  sentTime: "15 mins ago",
                  sender: "Zoe"
                }} />
                        <Message model={{
                  message: "Hello my friend",
                  sentTime: "15 mins ago",
                  sender: "Zoe"
                }} />
                        <Message model={{
                  message: "Hello my friend",
                  sentTime: "15 mins ago",
                  sender: "Zoe"
                }} />
                      </MessageGroup.Messages>      
                    </MessageGroup>
                    
                    <MessageGroup direction="outgoing">
                      <MessageGroup.Messages>
                        <Message model={{
                  message: "Hello my friend",
                  sentTime: "15 mins ago",
                  sender: "Akane"
                }} />
                        <Message model={{
                  message: "Hello my friend",
                  sentTime: "15 mins ago",
                  sender: "Akane"
                }} />
                        <Message model={{
                  message: "Hello my friend",
                  sentTime: "15 mins ago",
                  sender: "Akane"
                }} />
                        <Message model={{
                  message: "Hello my friend",
                  sentTime: "15 mins ago",
                  sender: "Akane"
                }} />
                      </MessageGroup.Messages>
                    </MessageGroup>
                    
                    { /*
                    <MessageGroup direction="incoming">
                      <Avatar src={zoeIco} name={"Zoe"} />
                      <MessageGroup.Messages>          
                        <Message model={{
                  message: "Hello my friend",
                  sentTime: "15 mins ago",
                  sender: "Zoe"
                }} />
                        <Message model={{
                  message: "Hello my friend",
                  sentTime: "15 mins ago",
                  sender: "Zoe"
                }} />
                      </MessageGroup.Messages>             
                    </MessageGroup>
                    
                    <MessageSeparator content="Saturday, 31 November 2019" />
                    
                    <MessageGroup direction="incoming">  
                      <Avatar src={zoeIco} name={"Zoe"} />
                      <MessageGroup.Messages>
                        <Message model={{
                  message: "Hello my friend",
                  sentTime: "15 mins ago",
                  sender: "Zoe"
                }} />
                      </MessageGroup.Messages>             
                    </MessageGroup>
                    
                    <MessageGroup direction="outgoing">
                      <MessageGroup.Messages>
                        <Message model={{
                          message: "Hello my friend",
                          sentTime: "15 mins ago",
                          sender: "Akane"
                        }} />
                      </MessageGroup.Messages>
                    </MessageGroup>
                    
                    <MessageGroup direction="incoming">          
                      <Avatar src={zoeIco} name={"Zoe"} />
                      <MessageGroup.Messages>
                        <Message model={{
                  message: "Hello my friend",
                  sentTime: "15 mins ago",
                  sender: "Zoe"
                }} />
                        <Message model={{
                  message: "Hello my friend",
                  sentTime: "15 mins ago",
                  sender: "Zoe"
                }} />
                        <Message model={{
                  message: "Hello my friend",
                  sentTime: "15 mins ago",
                  sender: "Zoe"
                }} />
                        <Message model={{
                  message: "Hello my friend",
                  sentTime: "15 mins ago",
                  sender: "Zoe"
                }} />
                      </MessageGroup.Messages>              
                    </MessageGroup>
                    
                    <MessageGroup direction="outgoing">
                      <MessageGroup.Messages>
                        <Message model={{
                          message: "Hello my friend",
                          sentTime: "15 mins ago",
                          sender: "Akane"
                        }} />
                        <Message model={{
                          message: "Hello my friend",
                          sentTime: "15 mins ago",
                          sender: "Akane"
                        }} />
                        <Message model={{
                          message: "Hello my friend",
                          sentTime: "15 mins ago",
                          sender: "Akane"
                        }} />
                        <Message model={{
                          message: "Hello my friend",
                          sentTime: "15 mins ago",
                          sender: "Akane"
                        }} />
                      </MessageGroup.Messages>
                    </MessageGroup>          
                    
                    <MessageGroup direction="incoming">
                      <Avatar src={zoeIco} name={"Zoe"} />
                      <MessageGroup.Messages>
                        <Message model={{
                  message: "Hello my friend",
                  sentTime: "15 mins ago",
                  sender: "Zoe"
                }} />
                        <Message model={{
                  message: "Hello my friend",
                  sentTime: "15 mins ago",
                  sender: "Zoe"
                }} />
                      </MessageGroup.Messages>                              
                    </MessageGroup>     

              */  }
            </MessageList>
          </div>;
}

export default MessagePage;