import { IS_CONNECTIING } from "../../constants"
import _ from "lodash"

const initialState = {
    is_connnecting: true
}

const ws = (state = initialState, action) => {
    // console.log("ws :", action);
    switch (action.type) {
        case IS_CONNECTIING:{
            return { ...state, is_connnecting: action.data };
        }
    }

    return state
}

export default ws;