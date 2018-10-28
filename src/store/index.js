import { combineReducers } from "redux";
import { all, fork } from "redux-saga/effects";
import { userProfileReducer, userProfileSaga } from './login'

export const rootReducer = combineReducers({
    profile: userProfileReducer,
});

export function* rootSaga() {
    yield all([fork(userProfileSaga)]);
}