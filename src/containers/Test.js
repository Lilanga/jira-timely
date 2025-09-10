import { connect } from 'react-redux';
import TestComponent from '../components/test/TestComponent';

const mapStateToProps = (state) => {
  console.log('Full Redux state:', state);
  return {
    worklogs: state.worklog?.worklogs || [],
    assignedIssues: state.worklog?.assignedIssues || [],
    userDetails: state.profile?.userDetails || {},
    isLoggedIn: state.profile?.isLoggedIn || false
  };
};

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(TestComponent);