import * as effects from "redux-saga/effects";

import * as actions from "./actions";
import { WORKLOG_REQUEST } from "./types";
import { getWorklogs } from "../../utils/jiraApi";
import { getCredentials } from '../../data/database';

function* handleGetWorklogs(action) {
    try {
        let credentials = yield effects.call(getCredentials);
        if(credentials === null){
            throw new Error("No credentials found");
        }

        console.log("Fetching worklogs with credentials:", credentials.email, action.payload);
        const res = yield effects.call(getWorklogs, credentials.url, credentials.email, credentials.password, action.payload.startDate, action.payload.endDate);
        console.log("Worklogs API response:", res);
        
        if (res) {
            yield effects.put(actions.worklogRequestSuccess(res));
        }
    } catch (err) {
        console.error("Worklog fetch error:", err);
        yield effects.put(actions.worklogRequestFailed(err));
    }
}

function* watchWorklogRequest() {
    yield effects.takeEvery(WORKLOG_REQUEST, handleGetWorklogs);
}

export function* worklogSaga() {
    yield effects.all([
        effects.fork(watchWorklogRequest)
    ]);
}