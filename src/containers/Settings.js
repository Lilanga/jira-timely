import { connect } from 'react-redux';
import Settings from '../components/settings/Settings';

const mapStateToProps = (state) => ({
  userDetails: state.profile?.userDetails || {},
  isLoggedIn: state.profile?.isLoggedIn || false
});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Settings);