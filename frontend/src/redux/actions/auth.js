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
    
        TERMS_AND_CONDITIONS} from "../../constants"

const _login = (data) => ({ type: LOGIN, data });
const _logout = (data) => ({ type: LOGOUT, data });

const _addedConversations = (data) => ({ type: ADDED_CONVERSATIONS, data });
const _addedConversation = (data) => ({ type: ADDED_CONVERSATION, data });

// 
const _addedNotifications = (data) => ({ type: ADDED_NOTIFICATIONS, data });
const _addedNotification = (data) => ({ type: ADDED_NOTIFICATION, data });

const _addedMessage = (data) => ({ type: ADDED_MESSAGE, data });
const _editedMessage = (data) => ({ type: EDITED_MESSAGE, data });
const _deletedMessage = (data) => ({ type: DELETED_MESSAGE, data });

const _addedBookmarks = (data) => ({ type: ADDED_BOOKMARKS, data });
const _addedBookmark = (data) => ({ type: ADDED_BOOKMARK, data });

const _termsAndConditions = (data) => ({ type: TERMS_AND_CONDITIONS, data });

export const login = (data) => (dispatch) => {
    dispatch(_login(data));
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

export const addedNotifications = (data) => (dispatch) => {
    dispatch(_addedNotifications(data));
}

export const addedNotification = (data) => (dispatch) => {
    dispatch(_addedNotification(data));
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