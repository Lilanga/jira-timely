import * as effects from "redux-saga/effects";
import { message } from 'antd';
import dates from "../../utils/dates";
import * as actions from "./actions";
import * as worklogActions from "../worklog/actions";
import { LOGIN_REQUEST, LOGOUT_REQUEST, SIGNIN_REQUEST, RESTORE_SESSION } from "./types";
import { validateAccount } from "../../utils/jiraApi";
import {saveCredentials, saveProfile, clearCredentials} from '../../data/database';
import { oauth as oauthService } from '../../services/oauth';

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
        yield* handleLoginErrors(err);
    }
}

function* handleSignIn(payload) {
    try {
        const res = yield effects.call(validateAccount, payload.payload.url, payload.payload.email, payload.payload.password);
        if (res) {
            yield handlePostSignIn(res);
        }
    } catch (err) {
        yield* handleLoginErrors(err);
    }
}

// Note: defined below with corrected payload handling

function* handleLoginErrors(error){
    const messageText = error instanceof Error 
        ? (error.message || 'Authentication failed')
        : 'Authentication failed';

    yield effects.put(actions.loginFailed(messageText));
    // Toast to inform user
    message.error('Invalid credentials. Please check your Jira domain, email, and API token.');
}

function* handleRestoreSession(payload) {
    try {
        // Restore session without API validation - credentials are already validated
        yield effects.put(actions.loginSuccess(payload.payload));
        
        // Load fresh worklog data for the landing page
        const range = {startDate: dates.add(new Date(), -30, "day"), endDate: new Date()};
        yield effects.put(worklogActions.worklogRequest(range));
    } catch (error) {
        console.error('Error restoring session:', error);
        yield effects.put(actions.loginFailed('Session restore failed'));
    }
}

function* handleLogout() {
    try {
        // Clear stored basic credentials and profile
        yield clearCredentials();
    } catch (e) {
        // noop
    }
    try {
        // Clear OAuth tokens if present
        yield oauthService.clearTokens?.();
    } catch (e) {
        // noop
    }
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

function* watchRestoreSession() {
    yield effects.takeEvery(RESTORE_SESSION, handleRestoreSession);
}

// use `fork()` here to split our saga into multiple watchers.
function* handlePostSignIn(res){
    // ensure reducer receives plain user object
    yield effects.put(actions.loginSuccess(res.payload));
    
    const range = {startDate: dates.add(new Date(), -30, "day"), endDate: new Date()};
    yield effects.put(worklogActions.worklogRequest(range));
}

export function* userProfileSaga() {
    yield effects.all([
        effects.fork(watchLoginRequest), 
        effects.fork(watchLogoutRequest), 
        effects.fork(watchSignInRequest),
        effects.fork(watchRestoreSession)
    ]);
}
