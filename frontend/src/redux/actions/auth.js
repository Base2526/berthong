import {UPDATED_PROFILE, 
        LOGOUT, 
        ADDED_CONVERSATIONS, 
        ADDED_CONVERSATION, 
        DELETED_CONVERSATION,

        ADDED_NOTIFICATIONS, 
        ADDED_NOTIFICATION, 

        ADDED_MESSAGES,
        ADDED_MESSAGE, 
        EDITED_MESSAGE, 
        DELETED_MESSAGE,
        ADDED_BOOKMARKS, 
        ADDED_BOOKMARK,

        EDITED_USER_BALANCE,
        EDITED_USER_BALANCE_BOOK,
    
        TERMS_AND_CONDITIONS} from "../../constants"

const _update_profile = (data) => ({ type: UPDATED_PROFILE, data });
const _logout = (data) => ({ type: LOGOUT, data });

const _addedConversations = (data) => ({ type: ADDED_CONVERSATIONS, data });
const _addedConversation = (data) => ({ type: ADDED_CONVERSATION, data });
const _deletedConversation = (data) => ({ type: DELETED_CONVERSATION, data });

// 
const _addedNotifications = (data) => ({ type: ADDED_NOTIFICATIONS, data });
const _addedNotification = (data) => ({ type: ADDED_NOTIFICATION, data });

const _addedMessages = (data) => ({ type: ADDED_MESSAGES, data });
const _addedMessage = (data) => ({ type: ADDED_MESSAGE, data });
const _editedMessage = (data) => ({ type: EDITED_MESSAGE, data });
const _deletedMessage = (data) => ({ type: DELETED_MESSAGE, data });

const _addedBookmarks = (data) => ({ type: ADDED_BOOKMARKS, data });
const _addedBookmark = (data) => ({ type: ADDED_BOOKMARK, data });

const _termsAndConditions = (data) => ({ type: TERMS_AND_CONDITIONS, data });

const _editedUserBalace = (data) => ({ type: EDITED_USER_BALANCE, data });

const _editedUserBalaceBook = (data) => ({ type: EDITED_USER_BALANCE_BOOK, data });

export const update_profile = (data) => (dispatch) => {
    dispatch(_update_profile(data));
}

export const logout = (data) => (dispatch) => {
    dispatch(_logout(data));
}

export const addedConversations = (data) => (dispatch) => {
    dispatch(_addedConversations(data));
}

export const addedConversation = (data) => (dispatch) => {
    dispatch(_addedConversation(data));
}

export const deletedConversation = (data) => (dispatch) => {
    dispatch(_deletedConversation(data));
}

export const addedNotifications = (data) => (dispatch) => {
    dispatch(_addedNotifications(data));
}

export const addedNotification = (data) => (dispatch) => {
    dispatch(_addedNotification(data));
}

export const addedMessages = (data) => (dispatch) => {
    dispatch(_addedMessages(data));
}

export const addedMessage = (data) => (dispatch) => {
    dispatch(_addedMessage(data));
}

export const editedMessage = (data) => (dispatch) => {
    dispatch(_editedMessage(data));
}

export const deletedMessage = (data) => (dispatch) => {
    dispatch(_deletedMessage(data));
}

export const addedBookmarks = (data) => (dispatch) => {
    dispatch(_addedBookmarks(data));
}

export const addedBookmark = (data) => (dispatch) => {
    dispatch(_addedBookmark(data));
}

export const termsAndConditions = (data) => (dispatch) => {
    dispatch(_termsAndConditions(data));
}

export const editedUserBalace = (data) => (dispatch) =>{
    dispatch(_editedUserBalace(data));
};

export const editedUserBalaceBook = (data) => (dispatch) =>{
    dispatch(_editedUserBalaceBook(data));
};