import { combineReducers } from "redux";
import { all, fork } from "redux-saga/effects";
import { userProfileReducer, userProfileSaga } from './login';
import { worklogReducer, worklogSaga } from './worklog';

export const rootReducer = combineReducers({
    profile: userProfileReducer,
    worklog: worklogReducer
});

export function* rootSaga() {
    yield all([fork(userProfileSaga), fork(worklogSaga)]);
}