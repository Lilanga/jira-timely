import { connect } from "react-redux";
import { App } from '../components/app/App';
import { signInRequest } from '../store/login';

const mapDispatchToProps = dispatch => ({
  signInRequest: (payload) => {
    dispatch(signInRequest(payload));
  },
});

export default connect(null, mapDispatchToProps)(App);