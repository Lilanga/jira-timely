import React from 'react';

const TestComponent = ({ userDetails = {}, worklogs = [], assignedIssues = [] }) => {
  console.log('TestComponent - userDetails:', userDetails);
  console.log('TestComponent - worklogs:', worklogs);
  console.log('TestComponent - assignedIssues:', assignedIssues);
  
  return (
    <div style={{ padding: '120px 20px 20px 20px' }}>
      <h2>Test Component - Debug Info</h2>
      <div>
        <h3>User Details:</h3>
        <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '12px' }}>
          {JSON.stringify(userDetails, null, 2)}
        </pre>
      </div>
      <div>
        <h3>Stats:</h3>
        <p>Worklogs: {worklogs.length}</p>
        <p>Assigned Issues: {assignedIssues.length}</p>
        <p>User Display Name: {userDetails?.displayName || 'No user'}</p>
        <p>User Email: {userDetails?.emailAddress || 'No email'}</p>
      </div>
    </div>
  );
};

export default TestComponent;