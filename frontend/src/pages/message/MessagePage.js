import "./messenger.css";
import React, { useState, useEffect, useRef } from "react";
import styles from "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";

import { connect } from "react-redux";
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
import { setCookie, getCookie, getHeaders, truncate, handlerErrorApollo } from "../../util"

import * as Constants from "../../constants"

import { addedConversation, addedMessages, addedMessage, editedMessage } from "../../redux/actions/auth"

import ConversationItem from "./ConversationItem"

let unsubscribeSubMessage = null
const MessagePage = (props) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, conversations, messages, addedConversation, onMutationConversation, addedMessages, addedMessage, editedMessage } = props;

  const inputFile = useRef(null) 

  const [prevConversationList, setPrevConversationList] = useState(conversations);
  const [conversationList, setConversationList] = useState([]);
  const [currentConversation, setCurrentConversation] = useState( _.isEmpty(getCookie("conv")) ? null : getCookie("conv") );
  const [messageList, setMessageList] = useState([]);

  const [loadingMore, setLoadingMore] = useState(true);
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

  if(!_.isEmpty(errorMessage)){
    handlerErrorApollo( props, errorMessage )
  }

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
    // if(_.isEmpty(currentConversation)){
      let newConvs = _.sortBy(conversations, "updatedAt").reverse()
      setConversationList(newConvs)
      setPrevConversationList(newConvs)
      if(!_.isEmpty(newConvs)){

        let conv = getCookie("conv")
        if(_.isEmpty(conv)){
          setCurrentConversation(newConvs[0])

          setCookie("conv", JSON.stringify(newConvs[0]))
        }else{
          console.log(">>> ", conversations, conv)
        }
      } 
    // }
  }, [conversations])

  useEffect(()=>{
    console.log("currentConversation :", currentConversation)
    if(!_.isEmpty(currentConversation)){
      setLoadedMessages([])
      setLoadingMore(true)
      refetchMessage({conversationId: currentConversation._id});
    }
  }, [currentConversation])

  useEffect(()=>{
    if(!loadingMessage){
      if(!_.isEmpty(dataMessage?.message)){
        let { status, data, total } = dataMessage?.message

        // let groupedData =  _(data).groupBy( v => moment(v.createdAt).format('MM/DD/YYYY') ).value();
        // if(total === data.length) setLoadingMore(false)
        // if(status) setLoadedMessages(groupedData)

        if(status){
          addedMessages(data)
        }
      }
    }
  }, [dataMessage, loadingMessage])

  useEffect(()=>{
    if(!_.isEmpty(currentConversation)){
      let filterMessages = _.filter(messages, m=> m.conversationId === currentConversation._id )
      let groupedData =  _(filterMessages).groupBy( v => moment(v.createdAt).format('MM/DD/YYYY') ).value()

      setLoadingMore(false)
      setLoadedMessages(groupedData)
    }
  }, [messages, currentConversation])

  // status, waiting, sent, received, read
  const onSidebarLeft = () =>{
    return  <Sidebar position="left" scrollable={false}>
              <Search 
                placeholder={t("search")}
                onClearClick={(e)=>setConversationList(prevConversationList) }
                onChange={(e)=>{
                  if(!_.isEmpty(e)){
                    let newConversationList = _.filter(conversationList, conversation =>{ 
                      let mfriend = _.find(conversation.members, (member)=>member.userId !== user._id)
                      return conversation.lastSenderName.toLowerCase().includes(e.toLowerCase()) || 
                              conversation.info.toLowerCase().includes(e.toLowerCase()) || 
                              mfriend.name.toLowerCase().includes(e.toLowerCase())
                    })
                    setConversationList(newConversationList)
                  }else{
                    setConversationList(prevConversationList)
                  }
                }}/>
              <ConversationList>
                {
                  _.map(conversationList, (conversation)=>{
                    let muser = _.find(conversation.members, (member)=>member.userId === user._id)
                    let mfriend = _.find(conversation.members, (member)=>member.userId !== user._id)

                    let sender = _.find(conversation.members, (member)=>member.userId === conversation.senderId)
                    return  <Conversation
                              name={mfriend.name}
                              lastSenderName={sender?.name}
                              info={ truncate(conversation.info, 25)}
                              unreadCnt={muser.unreadCnt}
                              active={ conversation._id === currentConversation?._id ? true: false}
                              onClick={(e)=>{ 
                                setCurrentConversation(conversation)
                                setCookie("conv", JSON.stringify(conversation))
                               }}
                              lastActivityTime={moment(conversation.sentTime).format('M/D/YY, hh:mm A')}>
                              <Avatar src={mfriend.avatarSrc} name={conversation.avatarName} status={conversation.status} />

                              <Conversation.Operations visible>
                                <ConversationItem {...props} conversation={conversation} />
                              </Conversation.Operations>
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

  const handleScroll = (event) => {
    const element = event.target;
    if (element.scrollTop === 0) {
      // loadMoreMessages();
      console.log("handleScroll")
    }
  };

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
                onScroll={handleScroll}
                typingIndicator={<TypingIndicator content="Zoe is typing" />}
                loadingMore={false} 
                onYReachStart={onYReachStart()}
                >
                {/* { _.map( messageList, item=>{ return <MessageItem {...props} item={item} /> }) }   */}
                {
                  _.map(messageList, (v)=> v )
                }
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
                              status: Constants.STATUS_SENT,
                              message: messageInputValue,
                              sentTime: Date.now(),
                              senderName: user.displayName,
                              senderId: user._id, 
                              direction: "outgoing",
                              position: "single"
                            }

                if(/<\/?[a-z][\s\S]*>/i.test(messageInputValue)){
                  input = { ...input, type: "html" }
                }else{
                  input = { ...input, type: "text" }
                }

                addedMessage({ ...input, createdAt: moment().format(), updatedAt: moment().format() })
                addedConversation({ mutation: "CREATED", data: {...currentConversation, senderId: user._id,  info: messageInputValue }})

                onMessage({ variables: { mode: "NEW", input } });
                // setMessageInputValue("")

                // for (; i < maxCounter; i++) {
                  // messages.push(<Message key={3333} model={{
                  //   message: `Message ${ messageInputValue }`,
                  //   sender: "Zoe"
                  // }} />);
                // }
          
                // setLoadedMessages(messages.reverse().concat(loadedMessages));

                // setLoadedMessages([...loadedMessages, input ])
                setMessageInputValue("")

                // console.log("currentConversation :", currentConversation, )
              }}
            />
  }

  // const onYReachStart_bak = () => {
  //   if (!loadingMore) {
  //     return;
  //   }

  //   setLoadingMore(false);
  //   /* Fake fetch from API */

  
  //   setTimeout(() => {
  //     // const messages = [];
  //     const maxCounter = counter + 10;
  //     let i = counter;
  //     for (; i < maxCounter; i++) {
  //       // messages.push(<Message key={i} model={{
  //       //   message: `Message ${i}`,
  //       //   sender: "Zoe"
  //       // }} />);
  //       let newMessage  = <Message key={i} model={{ message: `Message +++ ${i}`, sender: "Zox" }} />
  //       setMessageList([...messageList, newMessage])
  //     }
  //     setLoadedMessages(messageList.reverse().concat(loadedMessages));
  //     setCounter(i);
  //     setLoadingMore(false);
  //   }, 1500);
  // };

  const onChangeFile = (event) =>{
    event.stopPropagation();
    event.preventDefault();
    // var file = event.target.files[0];
    console.log("file :", event.target.files);

    let messageInputValue = "picture"
    let input = {
      _id: new mongoose.Types.ObjectId(), 
      conversationId: currentConversation._id, 
      status: Constants.STATUS_SENT,
      type: "image",
      message: messageInputValue,
      sentTime: Date.now(),
      // sender: user.displayName,
      // senderId: user.id, 
      direction: "outgoing",
      position: "single",
      payload: [{ src: URL.createObjectURL(event.target.files[0]), alt: "Joe avatar", width: "100px" }],
      files:event.target.files
    }

    addedMessage(input)
    addedConversation({mutation: "CREATED", data: {...currentConversation, senderId: user._id,  info: messageInputValue}})

    
    onMessage({ variables: {mode: "NEW",  input } });
  }

  const onYReachStart = () => {
    if (loadingMore === true) {
      return;
    }

    let firstElement = Object.values(loadedMessages)[0]; // Get the first element
    // console.log("loadedMessages :", loadedMessages, !_.isEmpty(firstElement) ? firstElement[0] : firstElement)
    if(!_.isEmpty(firstElement)){
      refetchMessage({id: currentConversation._id, startId: (firstElement[0])?._id });
    }

    // 
    // setLoadingMore(true);
    /* Fake fetch from API */

    // setTimeout(() => {
    //   const messages = [];
    //   /* Add 10 messages */

    //   const maxCounter = counter + 2;
    //   let i = counter;

    //   for (; i < maxCounter; i++) {
    //     // messages.push(<Message key={i} model={{
    //     //   message: `Message ****${i}`,
    //     //   sender: "Zoe"
    //     // }} />);

    //     let input = {
    //                   _id: new mongoose.Types.ObjectId(), 
    //                   conversationId: currentConversation._id, 
    //                   status: Constants.STATUS_SENT,
    //                   message: `Message ****${i}`,
    //                   sentTime: Date.now(),
    //                   senderName: user.displayName,
    //                   senderId: user._id, 
    //                   direction: "outgoing",
    //                   position: "single"
    //                 }

    //     if(/<\/?[a-z][\s\S]*>/i.test(`Message ****${i}`)){
    //       input = { ...input, type: "html" }
    //     }else{
    //       input = { ...input, type: "text" }
    //     }

    //     messages.push(input)
    //   }

    //   // setLoadedMessages([...messages, ...loadedMessages]/*messages.reverse().concat(loadedMessages)*/ );
    //   // setCounter(i);
    //   setLoadingMore(false);
    // }, 1500);
  };

  return (
    <div style={{ height: "600px", overflow: "hidden" }}>
      <div className="pl-2 pr-2">
        <div className="table-responsive MuiBox-root page-message">
          <div style={{  position: "relative", width: "100%" }} className="Mui-submess-root" >
            <MainContainer responsive>
              {onSidebarLeft()}
              <ChatContainer>
                {onConversationHeader()}
                {/* {onMessageList()} */}

                {
                  // loadingMessage
                  // ? <LinearProgress />
                  // : 
                  <MessageList 
                    loadingMore={loadingMore} 
                    onYReachStart={onYReachStart}>
                      {
                        _.map(loadedMessages, (v, k)=>{
                          let xx = []
                          let count = 0
                          if(count === 0){
                            count++
                            xx.push(<MessageSeparator content={`${ (moment(new Date(k), 'MM/DD/YYYY')).format('MMMM Do YYYY') }`}/> ) 
                          }

                          _.map(v, vv=>{
                            xx.push( <MessageItem {...props} item={vv} /> )
                          })
                          return xx
                        })
                      } 
                        {/*
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

                        */}
                  
                </MessageList>
                }
                
                {/*  */}

                {onMessageInput()}
              </ChatContainer>
              {/* {onSidebarRight()} */}
              <input type='file' id='file' ref={inputFile} style={{display: 'none'}}  onChange={onChangeFile} />
            </MainContainer>

            
          </div>
        </div>
      </div>
    </div>
  );
}

// 

const mapStateToProps = (state, ownProps) => {
  return {  user:state.auth.user, 
            ws: state.ws, 
            conversations: state.auth.conversations, 
            messages: state.auth.messages }
}

const mapDispatchToProps = {
  addedConversation,
  addedMessages,
  addedMessage, 
  editedMessage
}

export default connect( mapStateToProps, mapDispatchToProps )(MessagePage)