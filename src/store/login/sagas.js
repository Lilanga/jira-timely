import * as effects from "redux-saga/effects";

import * as actions from "./actions";
import { LOGIN_REQUEST } from "./types";
import { validateAccount } from '../../utils/jiraApi';

function* handleFetchProfile(payload) {
    try {
        // To call async functions, use redux-saga's `call()`.
        const res = yield effects.call(validateAccount, payload.payload.url, payload.payload.username, payload.payload.password);

        if (res) {
            yield effects.put(actions.loginSuccess(res));
        }
    } catch (err) {
        if (err instanceof Error) {
            yield effects.put(actions.loginFailed(err.stack));
        } else {
            yield effects.put(actions.loginFailed("An unknown error occured."));
        }
    }
}

// use `take*()` functions to watch Redux for a specific action
// type, and run our saga.
function* watchFetchRequest() {
    yield effects.takeEvery(LOGIN_REQUEST, handleFetchProfile);
}

// use `fork()` here to split our saga into multiple watchers.
export function* userProfileSaga() {
    yield effects.all([effects.fork(watchFetchRequest)]);
}