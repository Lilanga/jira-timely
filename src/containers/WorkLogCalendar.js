import { connect} from "react-redux";
import { WorkLogCalendar } from '../components/workLogCalendar/WorkLogCalendar';

const mapStateToProps = state => ({
    worklogs: state.worklog.worklogs,
  });
  
  const mapDispatchToProps = () => ({});
  
  export default connect(mapStateToProps, mapDispatchToProps)(WorkLogCalendar);