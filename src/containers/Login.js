import { connect} from "react-redux";
import { Login } from '../components/login/Login';
import { loginRequest } from '../store/login';

const mapStateToProps = state => ({
    isLoggedIn: state.profile.isLoggedIn
  });
  
  const mapDispatchToProps = dispatch => ({
    loginRequest: (payload) => {
      dispatch(loginRequest(payload));
    },
  });
  
  export default connect(mapStateToProps, mapDispatchToProps)(Login);