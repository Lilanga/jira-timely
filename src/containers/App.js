import { connect } from "react-redux";
import { App } from '../components/app/App';
import { signInRequest, logoutRequest } from '../store/login';

const mapStateToProps = (state) => ({
  userDetails: state.profile?.userDetails || {},
  isLoggedIn: state.profile?.isLoggedIn || false,
  isLoading: state.profile?.isLoading || false
});

const mapDispatchToProps = dispatch => ({
  signInRequest: (payload) => {
    dispatch(signInRequest(payload));
  },
  logoutRequest: () => {
    dispatch(logoutRequest());
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(App);