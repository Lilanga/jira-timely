import { connect} from "react-redux";
import { Navigation } from '../components/navigation/Navigation';
import { logoutRequest } from '../store/login';

const mapStateToProps = state => ({
    isLoggedIn: state.profile.isLoggedIn,
    userDetails: state.profile.userDetails,
  });

  const mapDispatchToProps = dispatch => ({
    logoutRequest: () => {
      dispatch(logoutRequest());
    },
  });
  
  export default connect(mapStateToProps, mapDispatchToProps)(Navigation);