import * as types from './types';
  
  export const INITIAL_STATE = { worklogs: {}, isLoading: false, error:null};
  
  export function worklogReducer(state = INITIAL_STATE, action) {
    switch (action.type) {
      case types.WORKLOG_REQUEST:
        return { ...state, isLoading: true };
      case types.WORKLOG_REQUEST_FAILED:
        return { ...state, worklogs:{}, isLoading: false, error:action.payload };
      case types.WORKLOG_REQUEST_SUCCESS:
        return { ...state, worklogs: action.payload, error:null, isLoading: false };
      default:
        return state;
    }
  }