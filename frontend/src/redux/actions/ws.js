import { IS_CONNECTIING, WS_STATUS } from "../../constants"

const _ls_connecting = (data) => ({ type: IS_CONNECTIING, data });
const _ws_status = (data) => ({ type: WS_STATUS, data });

export const ls_connecting = (data) => (dispatch) => {
    dispatch(_ls_connecting(data));
}

export const ws_status = (data) => (dispatch) => {
    dispatch(_ws_status(data));
}