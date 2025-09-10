import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Timely from '../components/timely/Timely';
import { worklogRequest, assignedIssuesRequest, addWorklogRequest } from '../store/worklog/actions';

const mapStateToProps = (state) => ({
  worklogs: state.worklog.worklogs || [],
  assignedIssues: state.worklog.assignedIssues || [],
  isLoading: state.worklog.isLoading || false,
  isLoadingIssues: state.worklog.isLoadingIssues || false,
  userDetails: state.profile?.userDetails,
  isLoggedIn: state.profile?.isLoggedIn || false
});

const mapDispatchToProps = (dispatch) => 
  bindActionCreators({
    worklogRequest,
    assignedIssuesRequest,
    addWorklogRequest
  }, dispatch);

const TimelyContainer = connect(mapStateToProps, mapDispatchToProps)(Timely);

export default TimelyContainer;