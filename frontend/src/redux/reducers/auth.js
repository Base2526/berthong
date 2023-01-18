
import {LOGIN, 
        LOGOUT, 
        ADDED_CONVERSATIONS, 
        ADDED_CONVERSATION,

        ADDED_NOTIFICATIONS, 
        ADDED_NOTIFICATION,

        ADDED_MESSAGE, 
        EDITED_MESSAGE, 
        DELETED_MESSAGE,
        ADDED_BOOKMARKS, 
        ADDED_BOOKMARK,
    
        TERMS_AND_CONDITIONS } from "../../constants"

import _ from "lodash"

const initialState = {
    user: {},
    conversations: [],
    bookmarks:[],
    messages:[],

    notifications: [],
    terms_and_conditions: false
}

const auth = (state = initialState, action) => {
    // console.log("auth :", action);
    switch (action.type) {
        case LOGIN:{
            return { ...state, user: action.data };
        }

        case LOGOUT:{
            localStorage.removeItem("token");
            return {...initialState, terms_and_conditions: state.terms_and_conditions};
        }

        case ADDED_CONVERSATIONS: {
            return  {...state, conversations: action.data }
        }

        case ADDED_CONVERSATION: {
            let {mutation, data} = action.data

            // console.log("ADDED_CONVERSATION #0 :", mutation, data)

            let conversations = [...state.conversations]
            if(_.find(conversations, (c)=>c._id == data._id)){

                // console.log("ADDED_CONVERSATION #1 :", mutation, data)
                return { ...state, conversations: _.map(conversations, (c)=>c._id==data._id ? data : c ) };
            }
            switch(mutation){
                case "CREATED":
                case "UPDATED":{
                    conversations = [...conversations, data]
                    break;
                }
            }

            // console.log("ADDED_CONVERSATION #2 :", mutation, data, conversations)
            return { ...state, conversations };
        }

        case ADDED_NOTIFICATIONS: {
            return  {...state, notifications: action.data }
        }

        case ADDED_NOTIFICATION: {
            let {mutation, data} = action.data

            let notifications = [...state.notifications]
            if(_.find(notifications, (c)=>c._id == data._id)){
                return { ...state, notifications: _.map(notifications, (c)=>c._id==data._id ? data : c ) };
            }
            switch(mutation){
                case "CREATED": 
                case "UPDATED":{
                    notifications = [...notifications, data]
                    break;
                }
            }

            console.log("ADDED_NOTIFICATION : ", notifications, mutation, data)

            return { ...state, notifications };
        }

        case ADDED_MESSAGE: {
            let messages = [...state.messages]
            messages = [...messages, action.data]
            return { ...state, messages };
        }

        case EDITED_MESSAGE: {
            let messages = [...state.messages]
            let newMessages = _.map(messages, m=>m._id===action.data.id ? action.data : m)

            return { ...state, messages:newMessages };
        }
        
        case DELETED_MESSAGE:{
            let messages = [...state.messages]
            let newMessages = _.filter(messages, m=>m._id!==action.data.id)
            return { ...state, messages:newMessages };
        }

        case ADDED_BOOKMARKS: {
            console.log("ADDED_BOOKMARKS : ", action.data)
            if(!_.isEqual(state.bookmark, action.data)){
                return  {...state, bookmarks: action.data }
            }
            return state
        }

        case ADDED_BOOKMARK: {
            let {mutation, data} = action.data

            console.log("ADDED_BOOKMARK :", action.data, state.bookmarks)

            let result = null;
            if(_.isEmpty(mutation)){
                let bookmarks = [...state.bookmarks]
                
                let bookmark = _.find(bookmarks, (bookmark)=> bookmark.postId === action.data.postId && bookmark.userId === action.data.userId)
            
                if(_.isEmpty(bookmark)){
                    bookmarks = [...bookmarks, {...action.data, local:true}]
                    result =  { ...state, bookmarks };
                }else{
                    bookmarks = _.map(bookmarks, (bookmark)=>bookmark.postId === action.data.postId && bookmark.userId === action.data.userId ? {...bookmark, status:action.data.status,  local:true} : bookmark )
                    result =  { ...state, bookmarks };
                }
            }

            console.log("state.auth.bookmarks :" , result, action.data)
            return result;

    
            /*
            if(_.isEmpty(mutation)){
                let bookmarks = [...state.bookmarks]
                let bookmark = _.find(bookmarks, (bookmark)=> bookmark.id === action.data.id)
    
                if(!_.isEmpty(bookmark)){
                    if(!_.isEqual(bookmark, action.data)){
                        return { ...state, bookmarks: _.map(bookmarks, (c)=>c.id==action.data.id ? action.data : c ) };
                    }
                }else{
                    bookmarks = [...bookmarks, action.data]
    
                    return { ...state, bookmarks };
                }
            }

            */
           

            // let {mutation, data} = action.data

            // let bookmarks = [...state.bookmarks]
            // if(_.find(bookmarks, (c)=>c.id == data.id)){

            //     console.log("_.map(conversations, (c)=>c.id==data.id ? data : c ) :", _.map(bookmarks, (c)=>c.id==data.id ? data : c ))
            //     return { ...state, bookmarks: _.map(bookmarks, (c)=>c.id==data.id ? data : c ) };
            // }
            // switch(mutation){
            //     case "CREATED":
            //     case "UPDATED":{
            //         bookmarks = [...bookmarks, data]
            //         break;
            //     }
            // }
            // return { ...state, bookmarks };
        }

        case TERMS_AND_CONDITIONS:{
            return { ...state, terms_and_conditions: action.data };
        }
    }

    return state
}

export default auth;