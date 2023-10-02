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
  ExpansionPanel
} from "@chatscope/chat-ui-kit-react";
import LinearProgress from '@mui/material/LinearProgress';
import _ from "lodash"
import { useQuery, useMutation } from "@apollo/client";
import moment from "moment";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import mongoose from "mongoose";

import { queryMessage, mutationMessage, subMessage, gqlUpdateMessageRead, queryConversations} from "../../apollo/gqlQuery"
import MessageItem from "./MessageItem"
import { getHeaders, truncate, handlerErrorApollo } from "../../util"

let unsubscribeSubMessage = null
const MessagePage = (props) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, conversations } = props;

  const inputFile = useRef(null) 

  const [conversationList, setConversationList] = useState([]);
  const [currentConversation, setCurrentConversation] = useState([]);
  const [messageList, setMessageList] = useState([]);

  const [loadingMore, setLoadingMore] = useState(false);
  const [loadedMessages, setLoadedMessages] = useState([]);
  const [counter, setCounter] = useState(0);

  const [messageInputValue, setMessageInputValue] = useState("");

  const { loading: loadingMessage, 
          data: dataMessage, 
          error: errorMessage, 
          refetch: refetchMessage,
          subscribeToMore: subscribeToMoreMessage, 
          networkStatus }   =   useQuery(queryMessage, 
                                  { 
                                    context: { headers: getHeaders(location) }, 
                                    fetchPolicy: 'cache-first', 
                                    nextFetchPolicy: 'network-only', 
                                    notifyOnNetworkStatusChange: true
                                  });  

  const [onMessage, resultMessage] = useMutation(mutationMessage
    , {
        context: { headers: getHeaders(location) },
        update: (cache, {data: {message}}, context) => {
          let { status, data, conversation } = message
          if(status){
            let messages = cache.readQuery({ query: queryMessage, variables: { id: currentConversation._id } });
            if(!_.isEmpty(messages)){
              cache.writeQuery({ query: queryMessage, 
                                 data: { message: { ...messages.message, data: [...messages.message.data, data] } }, 
                                 variables: { id: currentConversation._id } }); 
            }
            let conv = cache.readQuery({ query: queryConversations, variables: { id: currentConversation._id } });
            if(!_.isEmpty(conv)){
              cache.writeQuery({  
                                  query: queryConversations, 
                                  data: { conversations: { ...conv.conversations, data: _.map(conv.conversations.data, (value)=> _.isEqual(value._id, conversation?._id) ? conversation : value ) } } 
                                }); 
            }
          }
        },
        onCompleted(data) {
          console.log(data)
        },
        onError(error){
          return handlerErrorApollo( props, error )
        }
    },  
  );

  const [onUpdateMessageRead, resultUpdateMessageRead] = useMutation(gqlUpdateMessageRead
    , {
        context: { headers: getHeaders() },
        update: (cache, {data: {updateMessageRead}}) => {

          console.log("update : updateMessageRead :", updateMessageRead)

          // addedConversation(updateMessageRead)
          // const data1 = cache.readQuery({
          //     query: gqlFetchMessage,
          //     variables: {conversationId: currentConversation._id},
          // });

          // let newData = {...data1.fetchMessage}

          // if(!_.find(newData.data, n=>n._id === addMessage._id)) {
          //   newData = {...newData, data: [...newData.data, addMessage]}
          //   cache.writeQuery({
          //       query: gqlFetchMessage,
          //       data: {
          //           fetchMessage: newData
          //       },
          //       variables: {conversationId: currentConversation._id},
          //   });
          // }
        },
        onCompleted({ data }) {
          console.log(data)
        },
        onError(error){
          return handlerErrorApollo( props, error )
        }
    },  
  );

  useEffect(()=>{
    return () => {
      unsubscribeSubMessage && unsubscribeSubMessage()
    };
  }, [])

  useEffect(()=>{
    let newConversations = _.sortBy(conversations, "updatedAt").reverse()
    setConversationList(newConversations)
    if(!_.isEmpty(newConversations)) setCurrentConversation(newConversations[0])
  }, [conversations])

  useEffect(()=>{
    if(!_.isEmpty(currentConversation)){
      refetchMessage({id: currentConversation._id});
      // onUpdateMessageRead({ variables: {conversationId: currentConversation._id} });
    }
  }, [currentConversation])

  useEffect(()=>{
    if(!loadingMessage){
      if(!_.isEmpty(dataMessage?.message)){
        let { status, data } = dataMessage?.message
        if(status) setMessageList(data)
      }
    }
  }, [dataMessage, loadingMessage])
  
  // status, waiting, sent, received, read
  const onSidebarLeft = () =>{
    return  <Sidebar position="left" scrollable={false}>
              <Search 
                placeholder="Search..." 
                onClearClick={(e)=>{
                  // setConversationList(preConversationList)
                  console.log("setConversationList")
                }}
                onChange={(e)=>{
                  // if(!_.isEmpty(e)){
                    let newConversationList = _.filter(conversationList, conversation =>{ 
                      let mfriend = _.find(conversation.members, (member)=>member.userId !== user._id)
                      return conversation.lastSenderName.toLowerCase().includes(e.toLowerCase()) || 
                             conversation.info.toLowerCase().includes(e.toLowerCase()) || 
                             mfriend.name.toLowerCase().includes(e.toLowerCase())
                    })
                    setConversationList(newConversationList)
                  // }else{
                  //   setConversationList(preConversationList)
                  // }
                }}/>
              <ConversationList>
                {
                  _.map(conversationList, (conversation)=>{
                    console.log("conversation :", conversation)
                    let muser = _.find(conversation.members, (member)=>member.userId === user._id)
                    let mfriend = _.find(conversation.members, (member)=>member.userId !== user._id)

                    return  <Conversation
                              name={mfriend.name}
                              lastSenderName={conversation.lastSenderName}
                              info={ truncate(conversation.info, 25)}
                              unreadCnt={muser.unreadCnt}
                              active={ conversation._id === currentConversation._id ? true: false}
                              onClick={(e)=>{ setCurrentConversation(conversation) }}
                              lastActivityTime={moment(conversation.sentTime).format('M/D/YY, hh:mm A')}>
                              <Avatar src={mfriend.avatarSrc} name={conversation.avatarName} status={conversation.status} />
                            </Conversation>
                  })
                }
              </ConversationList>
            </Sidebar>
  }

  const onConversationHeader = () =>{
    if(_.isEmpty(currentConversation)){
      return <div />
    }

    let friend = _.find(currentConversation.members, (member)=>member.userId !== user._id)
    return  <ConversationHeader>
              <ConversationHeader.Back />
              <Avatar src={friend.avatarSrc} name={friend.name} />
              <ConversationHeader.Content
                userName={friend.name}
                info={moment(currentConversation.sentTime).format('M/D/YY, hh:mm A')}
              />
              <ConversationHeader.Actions>
                {/* <VoiceCallButton />
                <VideoCallButton /> */}
                <InfoButton />
              </ConversationHeader.Actions>
            </ConversationHeader>
  }

  const onSidebarRight = () =>{
    return  <Sidebar position="right">
              <ExpansionPanel open title="INFO">
                <p>Lorem ipsum</p>
                <p>Lorem ipsum</p>
                <p>Lorem ipsum</p>
                <p>Lorem ipsum</p>
              </ExpansionPanel>
              <ExpansionPanel title="LOCALIZATION">
                <p>Lorem ipsum</p>
                <p>Lorem ipsum</p>
                <p>Lorem ipsum</p>
                <p>Lorem ipsum</p>
              </ExpansionPanel>
              <ExpansionPanel title="MEDIA">
                <p>Lorem ipsum</p>
                <p>Lorem ipsum</p>
                <p>Lorem ipsum</p>
                <p>Lorem ipsum</p>
              </ExpansionPanel>
              <ExpansionPanel title="SURVEY">
                <p>Lorem ipsum</p>
                <p>Lorem ipsum</p>
                <p>Lorem ipsum</p>
                <p>Lorem ipsum</p>
              </ExpansionPanel>
              <ExpansionPanel title="OPTIONS">
                <p>Lorem ipsum</p>
                <p>Lorem ipsum</p>
                <p>Lorem ipsum</p>
                <p>Lorem ipsum</p>
              </ExpansionPanel>
            </Sidebar>
  }

  const onMessageList = () =>{
  
    if(!loadingMessage){

      unsubscribeSubMessage =  subscribeToMoreMessage({
        document: subMessage,
        variables: { userId: user?._id, conversationId: currentConversation?._id },
        updateQuery: (prev, {subscriptionData, variables}) => {
          // if (!subscriptionData.data) return prev;
          console.log("")
          return prev;
        }
      })
      
      // console.log("subscribeToMoreMessage :", subscribeToMoreMessage)

      // let {executionTime, status, data}= fetchMessageValues.data.fetchMessage
      // let {subscribeToMore} = fetchMessageValues

      // console.log("unsubscribeSubMessage :",  user._id, currentConversation._id)
      // unsubscribeSubMessage =  subscribeToMore({
      //   document: subMessage,
      //   variables: { userId: user._id, conversationId: currentConversation._id },
      //   updateQuery: (prev, {subscriptionData, variables}) => {

      //     if (!subscriptionData.data) return prev;

      //     let {conversationId} = variables
      //     let {mutation, data} = subscriptionData.data.subMessage

      //     if(data.conversationId !== conversationId){
      //       return prev;
      //     }

      //     console.log("subMessage :", subscriptionData, variables)
          
      //     if(!_.find(prev.fetchMessage.data, (f)=>f._id === data._id)){
      //       let newPrev = {...prev.fetchMessage, data: [...prev.fetchMessage.data, data]}
      //       switch(mutation){
      //         case "CREATED":{
      //           break
      //         }
      //       }  

      //       return {fetchMessage: newPrev};
      //     }
      //     return prev
          
      //   }
      // });


      return  <MessageList
                // typingIndicator={<TypingIndicator content="Zoe is typing" />}
                // loadingMore={loadingMore} 
                // onYReachStart={onYReachStart()}
                >
                { _.map( messageList, item=>{ return <MessageItem {...props} item={item} /> }) }  
              </MessageList>  
    }
    
    return <LinearProgress />
  }

  const onMessageInput = () =>{
    return  <MessageInput
              placeholder="Type message here"
              value={messageInputValue}
              attachDisabled={true}
              attachButton={false}
              // onAttachClick={(f)=>{
              //   console.log("onAttachClick :", f)
              //   inputFile.current.click();
              // }}
              onChange={(val) =>{
                console.log("onChange :", val)
                setMessageInputValue(val)
              } }
              onSend={(a, b, c, d) => {
                let input = {
                              _id: new mongoose.Types.ObjectId(), 
                              conversationId: currentConversation._id, 
                              status: "waiting",
                              message: messageInputValue,
                              sentTime: Date.now(),
                              // sender: user.displayName,
                              // senderId: user.id, 
                              direction: "outgoing",
                              position: "single"
                            }

                if(/<\/?[a-z][\s\S]*>/i.test(messageInputValue)){
                  input = { ...input, type: "html" }
                }else{
                  input = { ...input, type: "text" }
                }

                onMessage({ variables: { mode: "NEW", input } });
                setMessageInputValue("")
              }}
            />
  }

  const onYReachStart = () => {
    if (loadingMore === true) {
      return;
    }

    setLoadingMore(true);
    /* Fake fetch from API */

    /*
    setTimeout(() => {
      const messages = [];

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
    */
  };

  const onChangeFile = (event) =>{
    event.stopPropagation();
    event.preventDefault();
    // var file = event.target.files[0];
    console.log("file :", event.target.files);

    let input = {
      _id: new mongoose.Types.ObjectId(), 
      conversationId: currentConversation._id, 
      status: "waiting",
      type: "image",
      message: "picture",
      sentTime: Date.now(),
      // sender: user.displayName,
      // senderId: user.id, 
      direction: "outgoing",
      position: "single",
      payload: [{ src: URL.createObjectURL(event.target.files[0]), alt: "Joe avatar", width: "100px" }],
      files:event.target.files
    }
    
    onMessage({ variables: {mode: "NEW",  input } });
  }

  return (
    <div className="pl-2 pr-2">
      <div className="table-responsive MuiBox-root page-message">
        <div style={{  position: "relative", width: "100%" }} className="Mui-submess-root" >
          <MainContainer responsive>
            {onSidebarLeft()}
            <ChatContainer>
              {onConversationHeader()}
              {onMessageList()}
              {onMessageInput()}
            </ChatContainer>
            {/* {onSidebarRight()} */}
            <input type='file' id='file' ref={inputFile} style={{display: 'none'}}  onChange={onChangeFile} />
          </MainContainer>
        </div>
      </div>
    </div>
  );
}

export default MessagePage;