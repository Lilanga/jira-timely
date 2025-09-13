import * as effects from "redux-saga/effects";
import { message } from 'antd';
import dates from "../../utils/dates";
import * as actions from "./actions";
import * as worklogActions from "../worklog/actions";
import { LOGIN_REQUEST, LOGOUT_REQUEST, SIGNIN_REQUEST, RESTORE_SESSION } from "./types";
import { validateAccount } from "../../utils/jiraApi";
import {saveCredentials, saveProfile, getProfile, clearCredentials} from '../../data/database';
import { oauth as oauthService } from '../../services/oauth';

function* handleLogin(payload) {
    try {
        console.log("Login saga triggered with payload:", payload);
        // To call async functions, use redux-saga's `call()`.
        const res = yield effects.call(validateAccount, payload.payload.url, payload.payload.email, payload.payload.password);
        console.log("Validation response:", res);
        if (res) {
            // Ensure credentials and profile are persisted before proceeding
            yield effects.call(saveCredentials, payload.payload);
            yield effects.call(saveProfile, res.payload);
            // Trigger post sign-in actions (loginSuccess + initial data loads)
            yield* handlePostSignIn(res);
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
            // For sign-in, persist as well to avoid race conditions
            yield effects.call(saveCredentials, payload.payload);
            yield effects.call(saveProfile, res.payload);
            yield* handlePostSignIn(res);
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
        // Load saved profile data for the header/profile section
        const savedProfile = yield effects.call(getProfile);
        
        if (savedProfile) {
            // Use saved profile data for proper header display
            yield effects.put(actions.loginSuccess(savedProfile));
        } else {
            // Fallback to credentials if no profile saved (shouldn't happen normally)
            yield effects.put(actions.loginSuccess(payload.payload));
        }
        
        // Load fresh worklog data for the landing page
        const startDate = dates.add(new Date(), -30, "day");
        const endDate = new Date();
        const toYmd = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
        yield effects.put(worklogActions.worklogRequest({
            startDate: toYmd(startDate),
            endDate: toYmd(endDate)
        }));
        // Load assigned issues as well
        yield effects.put(worklogActions.assignedIssuesRequest());
    } catch (error) {
        console.error('Error restoring session:', error);
        yield effects.put(actions.loginFailed('Session restore failed'));
    }
}

function* handleLogout() {
    try {
        console.log('Logout saga started - clearing all authentication data');
        
        // 1. Clear stored basic credentials and profile
        yield effects.call(clearCredentials);
        console.log('✓ Database credentials cleared');
        
        // 2. Clear OAuth tokens if present
        if (oauthService.clearTokens) {
            yield effects.call(oauthService.clearTokens.bind(oauthService));
            console.log('✓ OAuth tokens cleared');
        }
        
        // 3. Clear all localStorage (including any cached data)
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.clear();
            console.log('✓ LocalStorage cleared');
        }
        
        // 4. Clear any sessionStorage
        if (typeof window !== 'undefined' && window.sessionStorage) {
            window.sessionStorage.clear();
            console.log('✓ SessionStorage cleared');
        }
        
        // 5. Clear worklog data
        yield effects.put(worklogActions.clearWorklogData());
        console.log('✓ Worklog data cleared');
        
        // 6. Dispatch logout success to update Redux state
        yield effects.put(actions.loginFailed('Logged out'));
        console.log('✓ Redux state cleared');
        
        // 7. Force complete app reload to ensure clean slate
        yield effects.call(() => {
            setTimeout(() => {
                if (typeof window !== 'undefined') {
                    window.location.href = window.location.origin + '/#/login';
                    window.location.reload();
                }
            }, 100);
        });
        
    } catch (e) {
        console.error('Logout error:', e);
        // Even if cleanup fails, force reload
        if (typeof window !== 'undefined') {
            window.location.href = window.location.origin + '/#/login';
            window.location.reload();
        }
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
    
    // Format dates properly for worklog API
    const startDate = dates.add(new Date(), -30, "day");
    const endDate = new Date();
    const toYmd = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    yield effects.put(worklogActions.worklogRequest({
        startDate: toYmd(startDate),
        endDate: toYmd(endDate)
    }));
    // Also load assigned issues for the Timely dashboard
    yield effects.put(worklogActions.assignedIssuesRequest());
}

export function* userProfileSaga() {
    yield effects.all([
        effects.fork(watchLoginRequest), 
        effects.fork(watchLogoutRequest), 
        effects.fork(watchSignInRequest),
        effects.fork(watchRestoreSession)
    ]);
}
