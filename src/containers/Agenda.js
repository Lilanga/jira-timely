import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Agenda from '../components/agenda/Agenda';
import { assignedIssuesRequest, addWorklogRequest } from '../store/worklog/actions';

const mapStateToProps = (state) => ({
  assignedIssues: state.worklog.assignedIssues || [],
  worklogs: state.worklog.worklogs || [],
  isLoadingIssues: state.worklog.isLoadingIssues || false,
  userDetails: state.profile?.userDetails,
  isLoggedIn: state.profile?.isLoggedIn || false
});

const mapDispatchToProps = (dispatch) => 
  bindActionCreators({
    assignedIssuesRequest,
    addWorklogRequest
  }, dispatch);

const AgendaContainer = connect(mapStateToProps, mapDispatchToProps)(Agenda);

export default AgendaContainer;