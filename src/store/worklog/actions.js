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

// Assigned Issues Actions
export function assignedIssuesRequest() {
    return { type: types.ASSIGNED_ISSUES_REQUEST };
}

export function assignedIssuesRequestSuccess(payload) {
    return { type: types.ASSIGNED_ISSUES_REQUEST_SUCCESS, payload };
}

export function assignedIssuesRequestFailed(payload) {
    return { type: types.ASSIGNED_ISSUES_REQUEST_FAILED, payload };
}

// Add Worklog Actions
export function addWorklogRequest(payload) {
    return { type: types.ADD_WORKLOG_REQUEST, payload };
}

export function addWorklogRequestSuccess(payload) {
    return { type: types.ADD_WORKLOG_REQUEST_SUCCESS, payload };
}

export function addWorklogRequestFailed(payload) {
    return { type: types.ADD_WORKLOG_REQUEST_FAILED, payload };
}

export function clearWorklogData() {
    return { type: types.CLEAR_WORKLOG_DATA };
}