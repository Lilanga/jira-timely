import * as types from './types';
  
  export const INITIAL_STATE = { userDetails: {}, isLoggedIn: false, isLoading: false, };
  
  export function userProfileReducer(state = INITIAL_STATE, action) {
    switch (action.type) {
      case types.LOGIN_REQUEST:
        return { ...state, isLoading: true };
      case types.LOGIN_REQUEST_SUCCESS:
        return { ...state, userDetails: action.payload, isLoading: false, isLoggedIn: true };
      case types.LOGIN_REQUEST_FAILED:
        return { ...state, userDetails: {}, isLoading: false, isLoggedIn: false };
      default:
        return state;
    }
  }