import * as types from './types';

export function worklogRequestSuccess(payload) {
    return { type: types.WORKLOG_REQUEST_SUCCESS, payload };
}

export function worklogRequestFailed(payload) {
    return { type: types.WORKLOG_REQUEST_FAILED, payload };
}

export function worklogRequest(payload) {
    return { type: types.WORKLOG_REQUEST, payload };
}