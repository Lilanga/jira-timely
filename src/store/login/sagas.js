import * as effects from "redux-saga/effects";
import dates from "../../utils/dates";
import * as actions from "./actions";
import * as worklogActions from "../worklog/actions";
import { LOGIN_REQUEST, LOGOUT_REQUEST, SIGNIN_REQUEST } from "./types";
import { validateAccount } from "../../utils/jiraApi";
import {saveCredentials, saveProfile, clearCredentials} from '../../data/database';

function* handleLogin(payload) {
    try {
        console.log("Login saga triggered with payload:", payload);
        // To call async functions, use redux-saga's `call()`.
        const res = yield effects.call(validateAccount, payload.payload.url, payload.payload.email, payload.payload.password);
        console.log("Validation response:", res);
        if (res) {
            saveCredentials(payload.payload);
            saveProfile(res.payload);
            yield handlePostSignIn(res);
        }
    } catch (err) {
        console.error("Login error:", err);
        handleLoginErrors(err);
    }
}

function* handleSignIn(payload) {
    try {
        const res = yield effects.call(validateAccount, payload.payload.url, payload.payload.email, payload.payload.password);
        if (res) {
            yield handlePostSignIn(res);
        }
    } catch (err) {
        handleLoginErrors(err);
    }
}

function* handlePostSignIn(res){
    yield effects.put(actions.loginSuccess(res));
    
    const range = {startDate: dates.add(new Date(), -30, "day"), endDate: new Date()};
    yield effects.put(worklogActions.worklogRequest(range));
}

function* handleLoginErrors(error){
    if (error instanceof Error) {
        yield effects.put(actions.loginFailed(error.stack));
    } else {
        yield effects.put(actions.loginFailed("An unknown error occured."));
    }
}

function* handleLogout() {
    yield clearCredentials();
}

// use `take*()` functions to watch Redux for a specific action
// type, and run our saga.
function* watchLoginRequest() {
    yield effects.takeEvery(LOGIN_REQUEST, handleLogin);
}

function* watchSignInRequest() {
    yield effects.takeEvery(SIGNIN_REQUEST, handleSignIn);
}

function* watchLogoutRequest() {
    yield effects.takeEvery(LOGOUT_REQUEST, handleLogout);
}

// use `fork()` here to split our saga into multiple watchers.
export function* userProfileSaga() {
    yield effects.all([
        effects.fork(watchLoginRequest), 
        effects.fork(watchLogoutRequest), 
        effects.fork(watchSignInRequest)
    ]);
}