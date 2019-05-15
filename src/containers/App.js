import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { App } from '../components/app/App';
import { signInRequest } from '../store/login';

const mapDispatchToProps = dispatch => ({
  signInRequest: (payload) => {
    dispatch(signInRequest(payload));
  },
});

export default withRouter(connect(null, mapDispatchToProps)(App));