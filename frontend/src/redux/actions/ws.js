import { IS_CONNECTIING } from "../../constants"

const _ls_connecting = (data) => ({ type: IS_CONNECTIING, data });

export const ls_connecting = (data) => (dispatch) => {
    dispatch(_ls_connecting(data));
}