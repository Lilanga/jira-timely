import { connect} from "react-redux";
import { bindActionCreators } from 'redux';
import { WorkLogCalendar } from '../components/workLogCalendar/WorkLogCalendar';
import { worklogRequest, assignedIssuesRequest, addWorklogRequest } from '../store/worklog/actions';

const mapStateToProps = state => ({
    worklogs: state.worklog.worklogs || [],
    assignedIssues: state.worklog.assignedIssues || [],
    isLoading: state.worklog.isLoading || false,
    isLoadingIssues: state.worklog.isLoadingIssues || false,
    isAddingWorklog: state.worklog.isAddingWorklog || false,
    userDetails: state.profile?.userDetails,
    isLoggedIn: state.profile?.isLoggedIn || false
  });
  
  const mapDispatchToProps = (dispatch) => 
    bindActionCreators({
      worklogRequest,
      assignedIssuesRequest,
      addWorklogRequest
    }, dispatch);
  
  export default connect(mapStateToProps, mapDispatchToProps)(WorkLogCalendar);