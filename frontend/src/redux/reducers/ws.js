import { IS_CONNECTIING, WS_STATUS } from "../../constants"

const initialState = {
    is_connnecting: true,
    ws_status:""
}

const ws = (state = initialState, action) => {
    // console.log("ws :", action);
    switch (action.type) {
        case IS_CONNECTIING:{
            return { ...state, is_connnecting: action.data };
        }
        case WS_STATUS:{
            return { ...state, ws_status: action.data };
        }
    }
    return state
}

export default ws;