import axios from 'axios';
import moment from 'moment';
import { oauth as oauthService } from '../services/oauth';
import { getWorklogsFromIssues } from './payloadMappings';

// Base API client with OAuth authentication
const createApiClient = async () => {
  const accessToken = await oauthService.getValidAccessToken();
  const cloudId = oauthService.getCloudId();
  
  if (!cloudId) {
    throw new Error('No Jira site available. Please re-authenticate.');
  }

  return axios.create({
    baseURL: `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3`,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });
};

// Validate OAuth authentication
export async function validateOAuthAccount() {
  try {
    const apiClient = await createApiClient();
    const response = await apiClient.get('/myself');
    
    const userDetails = response.data;
    console.log('✅ OAuth authentication successful:', userDetails);
    
    // Normalize avatar URLs for consistency with existing code
    if (userDetails.avatarUrls) {
      userDetails.avatarUrls.extraSmall = userDetails.avatarUrls["16x16"];
      userDetails.avatarUrls.small = userDetails.avatarUrls["24x24"];
      userDetails.avatarUrls.medium = userDetails.avatarUrls["32x32"];
      userDetails.avatarUrls.large = userDetails.avatarUrls["48x48"];
    }
    
    return { payload: userDetails };
    
  } catch (error) {
    console.error('❌ OAuth validation failed:', error.response?.data || error.message);
    throw new Error(`OAuth authentication failed: ${error.response?.status || error.message}`);
  }
}

// Get worklogs using OAuth
export async function getWorklogsOAuth(startDate, endDate) {
  try {
    const apiClient = await createApiClient();
    
    // Search for issues assigned to current user with worklogs
    const jql = `assignee = currentUser() AND worklogDate >= "${startDate}" AND worklogDate <= "${endDate}" ORDER BY updated DESC`;
    
    const response = await apiClient.get('/search', {
      params: {
        jql: jql,
        fields: 'summary,worklog,issuetype,project,key',
        expand: 'worklog',
        maxResults: 100
      }
    });
    
    console.log('✅ Worklogs fetched successfully:', response.data);
    
    const issues = response.data.issues || [];
    
    // Filter worklogs by date range and current user
    const filteredIssues = issues.map(issue => {
      const filteredIssue = {
        ...issue,
        fields: {
          ...issue.fields,
          worklog: {
            worklogs: []
          }
        }
      };
      
      // Filter worklogs by date and user
      if (issue.fields.worklog && issue.fields.worklog.worklogs) {
        filteredIssue.fields.worklog.worklogs = issue.fields.worklog.worklogs.filter(log => {
          const logDate = new Date(log.started);
          const start = new Date(startDate);
          const end = new Date(endDate);
          
          return logDate >= start && logDate <= end;
        });
      }
      
      return filteredIssue;
    }).filter(issue => 
      issue.fields.worklog.worklogs && issue.fields.worklog.worklogs.length > 0
    );
    
    const worklogs = getWorklogsFromIssues(filteredIssues);
    console.log('📊 Processed worklogs:', worklogs);
    
    return worklogs;
    
  } catch (error) {
    console.error('❌ Get worklogs failed:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      // Token might be expired, try to refresh
      throw new Error('Authentication expired. Please re-authenticate.');
    }
    return []; // Return empty array to allow app to continue
  }
}

// Get assigned issues using OAuth
export async function getAssignedIssuesOAuth() {
  try {
    const apiClient = await createApiClient();
    
    // Search for unresolved issues assigned to current user
    const jql = 'assignee = currentUser() AND resolution = Unresolved ORDER BY updated DESC';
    
    const response = await apiClient.get('/search', {
      params: {
        jql: jql,
        fields: 'summary,status,issuetype,priority,updated,assignee,project',
        maxResults: 100
      }
    });
    
    console.log('✅ Assigned issues fetched successfully:', response.data);
    return response.data.issues || [];
    
  } catch (error) {
    console.error('❌ Get assigned issues failed:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      throw new Error('Authentication expired. Please re-authenticate.');
    }
    return []; // Return empty array to allow app to continue
  }
}

// Add worklog using OAuth
export async function addWorklogOAuth(issueKey, worklogData) {
  try {
    const apiClient = await createApiClient();
    
    // Jira Cloud v3 expects ADF for comment and a specific timestamp format
    const startedFormatted = moment(worklogData.started).format('YYYY-MM-DDTHH:mm:ss.SSSZZ');

    const payload = {
      started: startedFormatted,
      timeSpentSeconds: worklogData.timeSpentSeconds
    };

    if (worklogData.comment && String(worklogData.comment).trim().length > 0) {
      payload.comment = {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: String(worklogData.comment) }
            ]
          }
        ]
      };
    }
    
    console.log(`📝 Adding worklog to ${issueKey}:`, payload);
    
    const response = await apiClient.post(`/issue/${issueKey}/worklog`, payload);
    
    console.log('✅ Worklog added successfully:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('❌ Add worklog failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      throw new Error('Authentication expired. Please re-authenticate.');
    } else if (error.response?.status === 403) {
      throw new Error('Permission denied. Check your Jira project permissions for logging work.');
    } else if (error.response?.status === 404) {
      throw new Error(`Issue ${issueKey} not found or not accessible.`);
    }
    
    throw new Error(`Failed to add worklog: ${error.response?.data?.errorMessages?.[0] || error.message}`);
  }
}

// Get issue details using OAuth
export async function getIssueOAuth(issueKey) {
  try {
    const apiClient = await createApiClient();
    
    const response = await apiClient.get(`/issue/${issueKey}`, {
      params: {
        fields: 'summary,status,issuetype,priority,assignee,project,worklog'
      }
    });
    
    console.log('✅ Issue details fetched successfully:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('❌ Get issue failed:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      throw new Error('Authentication expired. Please re-authenticate.');
    }
    throw new Error(`Failed to get issue: ${error.response?.data?.errorMessages?.[0] || error.message}`);
  }
}

// Search issues using OAuth (for time entry modal)
export async function searchIssuesOAuth(query, maxResults = 20) {
  try {
    const apiClient = await createApiClient();
    
    // Build JQL query
    let jql = 'assignee = currentUser()';
    if (query && query.trim()) {
      jql += ` AND (summary ~ "${query.trim()}" OR key ~ "${query.trim()}")`;
    }
    jql += ' ORDER BY updated DESC';
    
    const response = await apiClient.get('/search', {
      params: {
        jql: jql,
        fields: 'summary,status,issuetype,project,key',
        maxResults: maxResults
      }
    });
    
    console.log('🔍 Issue search results:', response.data);
    return response.data.issues || [];
    
  } catch (error) {
    console.error('❌ Issue search failed:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      throw new Error('Authentication expired. Please re-authenticate.');
    }
    return [];
  }
}
