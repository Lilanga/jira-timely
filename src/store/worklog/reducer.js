import * as types from './types';
  
  export const INITIAL_STATE = { 
    worklogs: [], 
    assignedIssues: [],
    isLoading: false, 
    isLoadingIssues: false,
    isAddingWorklog: false,
    error: null,
    issuesError: null,
    worklogError: null
  };
  
  export function worklogReducer(state = INITIAL_STATE, action) {
    switch (action.type) {
      case types.WORKLOG_REQUEST:
        return { ...state, isLoading: true };
      case types.WORKLOG_REQUEST_FAILED:
        return { ...state, worklogs:[], isLoading: false, error:action.payload };
      case types.WORKLOG_REQUEST_SUCCESS:
        return { ...state, worklogs: action.payload, error:null, isLoading: false };
      
      case types.ASSIGNED_ISSUES_REQUEST:
        return { ...state, isLoadingIssues: true, issuesError: null };
      case types.ASSIGNED_ISSUES_REQUEST_FAILED:
        return { ...state, assignedIssues:[], isLoadingIssues: false, issuesError:action.payload };
      case types.ASSIGNED_ISSUES_REQUEST_SUCCESS:
        return { ...state, assignedIssues: action.payload, issuesError:null, isLoadingIssues: false };
      
      case types.ADD_WORKLOG_REQUEST:
        return { ...state, isAddingWorklog: true, worklogError: null };
      case types.ADD_WORKLOG_REQUEST_FAILED:
        return { ...state, isAddingWorklog: false, worklogError: action.payload };
      case types.ADD_WORKLOG_REQUEST_SUCCESS:
        return { ...state, isAddingWorklog: false, worklogError: null };
      
      default:
        return state;
    }
  }