import { connect} from "react-redux";
import { withRouter } from "react-router-dom";
import { App } from '../components/app/App';
import { loginRequest, logoutRequest } from '../store/login';

const mapStateToProps = state => ({
    isLoggedIn: state.profile.isLoggedIn,
    userDetails: state.profile.userDetails,
    loading: state.profile.isLoading,
  });
  
  const mapDispatchToProps = dispatch => ({
    loginRequest: (payload) => {
      dispatch(loginRequest(payload));
    },
    logoutRequest: () => {
      dispatch(logoutRequest());
    },
  });
  
  export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));