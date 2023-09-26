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
import { connect } from "react-redux";
import _ from "lodash"
import { useQuery, useMutation, useSubscription } from "@apollo/client";
import moment from "moment";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { queryMessage, mutationMessage, subMessage, gqlUpdateMessageRead, queryConversations} from "../gqlQuery"

// import { addedConversation } from "../../redux/actions/auth"

import MessageItem from "./MessageItem"

import { getHeaders, makeid, truncate } from "../util"

let unsubscribeSubMessage = null

const MessagePage = (props) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const {user, conversations /*, addedConversation*/ } = props;

  const inputFile = useRef(null) 

  const [conversationList, setConversationList] = useState(conversations);
  const [preConversationList, setPreConversationList] = useState(conversations);
  const [currentConversation, setCurrentConversation] = useState([]);//useState(conversations[0]);
  const [messageList, setMessageList] = useState([]);

  const [loadingMore, setLoadingMore] = useState(false);
  const [loadedMessages, setLoadedMessages] = useState([]);
  const [counter, setCounter] = useState(0);

  const [messageInputValue, setMessageInputValue] = useState("");

  //  fetchMessageValues
  const { loading: loadingMessage, 
          data: dataMessage, 
          error: errorMessage, 
          refetch: refetchMessage,
          subscribeToMore: subscribeToMoreMessage, 
          networkStatus }   =   useQuery(queryMessage, 
                                  { 
                                    context: { headers: getHeaders(location) }, 
                                    // variables: {conversationId: ""}, 
                                    fetchPolicy: 'cache-first', 
                                    nextFetchPolicy: 'network-only', 
                                    notifyOnNetworkStatusChange: true
                                  });  

  let { loading: loadingConversations, 
        data: dataConversations, 
        error: errorConversations  } =  useQuery( queryConversations, { 
                                                  context: { headers: getHeaders(location) }, 
                                                  fetchPolicy: 'cache-first', 
                                                  nextFetchPolicy: 'network-only', 
                                                  notifyOnNetworkStatusChange: true});

  const [onMessage, resultMessage] = useMutation(mutationMessage
    , {
        context: { headers: getHeaders(location) },
        update: (cache, {data: {message}}, context) => {
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
        onCompleted(data) {
          console.log(data)
        }
    },  
  );
  console.log("resultMessage :", resultMessage)

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
        }
    },  
  );

  // useEffect(()=>{
  //   return () => {
  //     console.log("cleaned up");
  //     unsubscribeSubMessage && unsubscribeSubMessage()
  //   };
  // }, [])

  // useEffect(()=>{
  //   if(!_.isEmpty(state)){
  //     let index = _.findIndex(conversations, (conversation)=>conversation._id === state.conversationId )
  //     setCurrentConversation(conversations[index === -1 ? 0 : index])
  //   }
  // }, [state])

  // useEffect(async()=>{
  //   // let mfriend = _.find(conversation.members, (member)=>member.userId !== user._id)
  //   // console.log("mfriend :", mfriend)
  //   // _.map(conversationList, (conversation)=>{
  //   // })
  //   // console.log("new_data :", new_data)
  //   setConversationList(conversations)
  //   setPreConversationList(conversations)
  //   // console.log("conversations :", currentConversation)
  // }, [conversations])

  useEffect(async()=>{
    if(!dataConversations){
      if(!_.isEmpty(dataConversations?.conversations)){
        let { status, data } = dataConversations?.conversations
        if(status){
          // setConversationList(data)
        }
      }
    }
  }, [dataConversations, loadingConversations])

  // useEffect(()=>{
  //   console.log("currentConversation :", currentConversation)
  //   if(!_.isEmpty(currentConversation)){
  //     fetchMessageValues.refetch({conversationId: currentConversation._id});
  //     onUpdateMessageRead({ variables: {conversationId: currentConversation._id} });
  //   }else{
  //     fetchMessageValues.refetch({conversationId: ""});
  //   }
  // }, [currentConversation])
  
  // status, waiting, sent, received, read
  const onSidebarLeft = () =>{
    return  <Sidebar position="left" scrollable={false}>
              <Search 
                placeholder="Search..." 
                onClearClick={(e)=>{
                  setConversationList(preConversationList)
                }}
                onChange={(e)=>{
                  if(!_.isEmpty(e)){
                    let newConversationList = _.filter(conversationList, conversation =>{ 
                      let mfriend = _.find(conversation.members, (member)=>member.userId !== user._id)
                      return conversation.lastSenderName.toLowerCase().includes(e.toLowerCase()) || conversation.info.toLowerCase().includes(e.toLowerCase()) || mfriend.name.toLowerCase().includes(e.toLowerCase())
                    })
                    setConversationList(newConversationList)
                  }else{
                    setConversationList(preConversationList)
                  }
                }}/>
              <ConversationList>
                {
                  _.map(conversationList, (conversation)=>{
                    let muser = _.find(conversation.members, (member)=>member.userId === user._id)
                    let mfriend = _.find(conversation.members, (member)=>member.userId !== user._id)

                    return  <Conversation
                              name={mfriend.name}
                              lastSenderName={conversation.lastSenderName}
                              info={ truncate(conversation.info, 25)}
                              unreadCnt={muser.unreadCnt}
                              active={ conversation._id === currentConversation._id ? true: false}
                              onClick={(e)=>{
                                setCurrentConversation(conversation)
                              }}
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
    /*
    if(!fetchMessageValues.loading){
      
      console.log("fetchMessageValues :", fetchMessageValues)

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

      let data = []

      return  <MessageList
                // typingIndicator={<TypingIndicator content="Zoe is typing" />}
                // loadingMore={loadingMore} 
                // onYReachStart={onYReachStart()}
                >
                { _.map( data, item=>{ return <MessageItem {...props} item={item} /> }) }  
              </MessageList>  
    }
    */
    return <div />
  }

  const onMessageInput = () =>{
    return  <MessageInput
              placeholder="Type message here"
              value={messageInputValue}
              onAttachClick={(f)=>{
                console.log("onAttachClick :", f)
                inputFile.current.click();
              }}
              onChange={(val) =>{
                console.log("onChange :", val)
                setMessageInputValue(val)
              } }
              onSend={(a, b, c, d) => {

                let input = {}
                if(/<\/?[a-z][\s\S]*>/i.test(messageInputValue)){
                  input = {
                            type: "html",
                            message: messageInputValue,
                            sentTime: Date.now(),
                            // sender: user.displayName,
                            // senderId: user.id, 
                            direction: "outgoing",
                            position: "single"
                          }
                        
                }else{
                  input = {
                            type: "text",
                            message: messageInputValue,
                            sentTime: Date.now(),
                            // sender: user.displayName,
                            // senderId: user.id, 
                            direction: "outgoing",
                            position: "single"
                          }
                }

                input = {...input, _id: makeid(20) , conversationId: currentConversation._id, status: "waiting" }

                console.log("input ", input, user._id)
                onMessage({ variables: {mode: "NEW", conversationId: currentConversation._id, input } });
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
      type: "image",
      message: "picture",
      sentTime: Date.now(),
      // sender: user.displayName,
      // senderId: user.id, 
      direction: "outgoing",
      position: "single",

      payload: [{
              src: URL.createObjectURL(event.target.files[0]),
              alt: "Joe avatar",
              width: "100px"
            }],

      files:event.target.files
    }
    
    input = {...input, _id: makeid(20) , conversationId: currentConversation._id, status: "waiting" }

    onMessage({ variables: {mode: "NEW", conversationId: currentConversation._id, input } });
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

// const mapStateToProps = (state, ownProps) => {
//   let user = state.auth.user;
//   let conversations = _.orderBy(state.auth.conversations, (dateObj) => new Date(dateObj.sentTime) , 'desc')
  
//   console.log("conversations :", conversations)

//   return {
//     user,
//     conversations
//   }
// };

// const mapDispatchToProps = {
//   // addedConversation
// }

export default MessagePage;