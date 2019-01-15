import * as types from './types';

export function loginRequest(payload) {
    return { type: types.LOGIN_REQUEST, payload };
}

export function loginSuccess(payload) {
    return { type: types.LOGIN_REQUEST_SUCCESS, payload };
}

export function loginFailed(payload) {
    return { type: types.LOGIN_REQUEST_FAILED, payload };
}

export function logoutRequest() {
    return { type: types.LOGOUT_REQUEST };
}