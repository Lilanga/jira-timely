import * as effects from "redux-saga/effects";

import * as actions from "./actions";
import { WORKLOG_REQUEST } from "./types";
import { getWorklogs } from "../../utils/jiraApi";
import { getCredentials } from '../../data/database';

function* handleGetWorklogs(action) {
    try {
        let credentials = yield getCredentials();
        if(credentials === null){
            throw new Error("No credentials found");
        }

        const res = yield effects.call(getWorklogs, credentials.url, credentials.email, credentials.password, action.payload.startDate, action.payload.endDate);
        if (res) {
            yield effects.put(actions.worklogRequestSuccess(res));
        }
    } catch (err) {
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