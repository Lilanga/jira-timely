import * as effects from "redux-saga/effects";
import { message } from 'antd';

import * as actions from "./actions";
import { WORKLOG_REQUEST, ASSIGNED_ISSUES_REQUEST, ADD_WORKLOG_REQUEST } from "./types";
import { getWorklogs, getAssignedIssues, addWorklog } from "../../utils/jiraApi";
import { getWorklogsOAuth, getAssignedIssuesOAuth, addWorklogOAuth } from "../../utils/jiraOAuthApi";
import { oauth as oauthService } from "../../services/oauth";
import * as loginActions from "../login/actions";
import { getCredentials } from '../../data/database';

function* handleGetWorklogs(action) {
    try {
        const useOAuth = oauthService.isAuthenticated();
        let res;
        if (useOAuth) {
            console.log("Fetching worklogs via OAuth", action.payload);
            res = yield effects.call(getWorklogsOAuth, action.payload.startDate, action.payload.endDate);
        } else {
            let credentials = yield effects.call(getCredentials);
            if(credentials === null){
                throw new Error("No credentials found");
            }
            console.log("Fetching worklogs with credentials:", credentials.email, action.payload);
            res = yield effects.call(getWorklogs, credentials.url, credentials.email, credentials.password, action.payload.startDate, action.payload.endDate);
        }
        console.log("Worklogs API response:", res);
        
        if (res) {
            yield effects.put(actions.worklogRequestSuccess(res));
        }
    } catch (err) {
        console.error("Worklog fetch error:", err);
        const msg = String(err?.message || err || '');
        if (msg.includes('UNAUTHORIZED') || msg.includes('401')) {
            yield effects.put(loginActions.loginFailed('Session expired or invalid token'));
            message.error('Session expired or invalid token. Please log in again.');
        } else {
            yield effects.put(actions.worklogRequestFailed(err));
        }
    }
}

function* handleGetAssignedIssues() {
    try {
        const useOAuth = oauthService.isAuthenticated();
        let res;
        if (useOAuth) {
            console.log("Fetching assigned issues via OAuth");
            res = yield effects.call(getAssignedIssuesOAuth);
        } else {
            let credentials = yield effects.call(getCredentials);
            if(credentials === null){
                throw new Error("No credentials found");
            }
            console.log("Fetching assigned issues with credentials:", credentials.email);
            res = yield effects.call(getAssignedIssues, credentials.url, credentials.email, credentials.password);
        }
        console.log("Assigned issues API response:", res);
        
        yield effects.put(actions.assignedIssuesRequestSuccess(res));
    } catch (err) {
        console.error("Assigned issues fetch error:", err);
        const msg = String(err?.message || err || '');
        if (msg.includes('UNAUTHORIZED') || msg.includes('401')) {
            yield effects.put(loginActions.loginFailed('Session expired or invalid token'));
            message.error('Session expired or invalid token. Please log in again.');
        } else {
            yield effects.put(actions.assignedIssuesRequestFailed(err));
        }
    }
}

function* handleAddWorklog(action) {
    try {
        const useOAuth = oauthService.isAuthenticated();
        let res;
        if (useOAuth) {
            console.log("Adding worklog via OAuth:", action.payload);
            res = yield effects.call(addWorklogOAuth, action.payload.issueKey, action.payload);
        } else {
            let credentials = yield effects.call(getCredentials);
            if(credentials === null){
                throw new Error("No credentials found");
            }
            console.log("Adding worklog with credentials:", credentials.email, action.payload);
            res = yield effects.call(addWorklog, credentials.url, credentials.email, credentials.password, action.payload.issueKey, action.payload);
        }
        console.log("Add worklog API response:", res);
        
        yield effects.put(actions.addWorklogRequestSuccess(res));
    } catch (err) {
        console.error("Add worklog error:", err);
        yield effects.put(actions.addWorklogRequestFailed(err));
    }
}

function* watchWorklogRequest() {
    yield effects.takeEvery(WORKLOG_REQUEST, handleGetWorklogs);
}

function* watchAssignedIssuesRequest() {
    yield effects.takeEvery(ASSIGNED_ISSUES_REQUEST, handleGetAssignedIssues);
}

function* watchAddWorklogRequest() {
    yield effects.takeEvery(ADD_WORKLOG_REQUEST, handleAddWorklog);
}

export function* worklogSaga() {
    yield effects.all([
        effects.fork(watchWorklogRequest),
        effects.fork(watchAssignedIssuesRequest),
        effects.fork(watchAddWorklogRequest)
    ]);
}
