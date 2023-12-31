export const UPDATED_PROFILE        = "UPDATED_PROFILE";
export const LOGOUT                 = "LOGOUT";

export const ADDED_CONVERSATIONS    = "ADDED_CONVERSATIONS";
export const ADDED_CONVERSATION     = "ADDED_CONVERSATION";
export const DELETED_CONVERSATION   = "DELETED_CONVERSATION";

export const ADDED_NOTIFICATIONS    = "ADDED_NOTIFICATIONS";
export const ADDED_NOTIFICATION     = "ADDED_NOTIFICATION";

export const ADDED_MESSAGES         = "ADDED_MESSAGES";
export const ADDED_MESSAGE          = "ADDED_MESSAGE";
export const EDITED_MESSAGE         = "EDITED_MESSAGE";
export const DELETED_MESSAGE        = "DELETED_MESSAGE";

export const ADDED_BOOKMARKS        = "ADDED_BOOKMARKS";
export const ADDED_BOOKMARK         = "ADDED_BOOKMARK";

export const IS_CONNECTIING         = "IS_CONNECTIING";

export const TERMS_AND_CONDITIONS   = "TERMS_AND_CONDITIONS";

export const EDITED_USER_BALANCE    = "EDITED_USER_BALANCE";

export const EDITED_USER_BALANCE_BOOK = "EDITED_USER_BALANCE_BOOK";


// AMDINISTRATOR, AUTHENTICATED, ANONYMOUS
// export const AMDINISTRATOR = "AMDINISTRATOR";
// export const AUTHENTICATED = "AUTHENTICATED";
// export const ANONYMOUS     = "ANONYMOUS";
export const ANONYMOUS        = 0;
export const AMDINISTRATOR    = 1;
export const AUTHENTICATED    = 2;
export const SELLER           = 3;


//// ws status
export const WS_STATUS      = "WS_STATUS";
export const WS_CONNECTION  = "WS_CONNECTION";
export const WS_CONNECTED   = "WS_CONNECTED";
export const WS_CLOSED      = "WS_CLOSED";
export const WS_SHOULD_RETRY= "SHOULD_RETRY";

// status code api
export const SUCCESS        = "SUCCESS";
export const ERROR          = "ERROR";
export const FORCE_LOGOUT   = "FORCE_LOGOUT";
export const DATA_NOT_FOUND = "DATA_NOT_FOUND";
export const USER_NOT_FOUND = "USER_NOT_FOUND";
export const PASSWORD_WRONG = "PASSWORD_WRONG";
export const UNAUTHENTICATED= "UNAUTHENTICATED";
export const INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR";
export const NOT_ENOUGH_BALANCE = "NOT_ENOUGH_BALANCE";
export const EXPIRE_DATE = "EXPIRE_DATE"

export const INIT_SEARCH = {
    PAGE: 1,
    LIMIT: 12,
    NUMBER: "",
    TITLE: "",
    DETAIL: "",
    PRICE: 500,
    CHK_BON: false,
    CHK_LAND: false,
    CHK_MONEY: false,
    CHK_GOLD: false
}

export const CANCEL         = 0;
export const OK             = 1;

export const SUPPLIER       = 10;
export const DEPOSIT        = 11;
export const WITHDRAW       = 12;

export const WAIT           = 13;
export const APPROVED       = 14;
export const REJECT         = 15;

export const NEW            = 16;
export const DELETE         = 17;

// Sent, Delivered, Read, Failed
export const STATUS_SENT        = 50;
export const STATUS_DELIVERED   = 51;
export const STATUS_FAILED      = 52;

export const BANKS=[{label: '(xxx-x-xxxxx-x)ธนาคารไทยพาณิชย์', id: "bank-01" },{ label: '(xxx-x-xxxxx-x)ธนาคารกสิกรไทย', id: "bank-02" }]
