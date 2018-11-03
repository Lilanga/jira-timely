import { connect} from "react-redux";
import { Loader } from '../components/loader/Loader';

const mapStateToProps = state => ({
    isLoading: state.profile.isLoading,
  });
  
  const mapDispatchToProps = () => ({});
  
  export default connect(mapStateToProps, mapDispatchToProps)(Loader);