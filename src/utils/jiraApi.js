import {formatToJiraDate, getWorklogsFromIssues} from './payloadMappings';

export function getIssue(issueKey) {
    return new Promise((resolve, reject) => {
        const host = process.env.REACT_APP_JIRA_API_ENDPOINT;
        const username = process.env.REACT_APP_JIRA_USER_NAME;
        const password = process.env.REACT_APP_JIRA_PASSWORD;

        if (!host || !username || !password) {
            reject(new Error('Missing JIRA credentials or host in environment variables'));
            return;
        }

        const authString = btoa(`${username}:${password}`);
        const url = `https://${host}/rest/api/2/issue/${encodeURIComponent(issueKey)}`;

        fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${authString}`,
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Issue fetch failed: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(issue => resolve(issue))
        .catch(err => reject(err));
    });
}

export function searchUser(username, password) {
    return new Promise((resolve, reject) => {
        const host = process.env.REACT_APP_JIRA_API_ENDPOINT;
        if (!host) {
            reject(new Error('Missing JIRA host in environment variables'));
            return;
        }

        const authString = btoa(`${username}:${password}`);
        // Older API used `username`, newer uses `query`. Try `query` first, fall back to `username`.
        const query = encodeURIComponent(username);
        const urls = [
            `https://${host}/rest/api/2/user/search?query=${query}`,
            `https://${host}/rest/api/2/user/search?username=${query}`
        ];

        // Try endpoints sequentially until one succeeds
        (async () => {
            for (const url of urls) {
                try {
                    const res = await fetch(url, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Basic ${authString}`,
                            'Accept': 'application/json'
                        }
                    });
                    if (!res.ok) continue;
                    const users = await res.json();
                    resolve(users && users.length ? users[0] : null);
                    return;
                } catch (_) {
                    // try next
                }
            }
            reject(new Error('User search failed'));
        })();
    });
}

export function validateAccount(url, username, password) {
    return new Promise((resolve, reject) => {
        // Make direct REST API call to /rest/api/2/myself (GDPR compliant)
        const authString = btoa(`${username}:${password}`);
        const apiUrl = `https://${url}/rest/api/2/myself`;
        
        fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${authString}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(user => {
            let userDetailsData = Object.assign({}, user);
            
            // Handle avatar URLs if they exist
            if (userDetailsData.avatarUrls) {
                userDetailsData.avatarUrls.extraSmall = userDetailsData.avatarUrls["16x16"];
                userDetailsData.avatarUrls.small = userDetailsData.avatarUrls["24x24"];
                userDetailsData.avatarUrls.medium = userDetailsData.avatarUrls["32x32"];
                userDetailsData.avatarUrls.large = userDetailsData.avatarUrls["48x48"];

                delete userDetailsData.avatarUrls["16x16"];
                delete userDetailsData.avatarUrls["24x24"];
                delete userDetailsData.avatarUrls["32x32"];
                delete userDetailsData.avatarUrls["48x48"];
            }
            
            resolve({ payload: userDetailsData });
        })
        .catch(error => {
            reject(error);
        });
    });
}

export function getWorklogs(url, username, password, startDate, endDate) {
    return new Promise((resolve, reject) => {
        const authString = btoa(`${username}:${password}`);
        
        // First, let's test what permissions we have by trying a simple GET request
        console.log("Testing API permissions with myself endpoint...");
        
        // Try a simple test first
        fetch(`https://${url}/rest/api/2/myself`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${authString}`,
                'Accept': 'application/json'
            }
        })
        .then(response => {
            console.log("Myself endpoint status:", response.status);
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('UNAUTHORIZED');
                }
                throw new Error(`API access failed: ${response.status}`);
            }
            return response.json();
        })
        .then(userData => {
            console.log("Current user data:", userData);
            
            // Now try a basic GET search instead of POST
            const jql = encodeURIComponent("assignee = currentUser() ORDER BY updated DESC");
            const searchUrl = `https://${url}/rest/api/2/search?jql=${jql}&fields=summary,worklog,issuetype,project,key&maxResults=10`;
            
            console.log("Trying GET search:", searchUrl);
            
            return fetch(searchUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${authString}`,
                    'Accept': 'application/json'
                }
            });
        })
        .then(response => {
            console.log("Search response status:", response.status);
            if (!response.ok) {
                if (response.status === 403) {
                    console.warn("Search API access denied. Returning empty worklog data.");
                    // Return empty array instead of failing - user can still use the app
                    resolve([]);
                    return null;
                } else {
                    throw new Error(`Search failed: ${response.status} ${response.statusText}`);
                }
            }
            return response.json();
        })
        .then(response => {
            if (response === null) return; // Already resolved with empty array
            
            console.log("Search response:", response);
            
            // Process the results
            let issues = response.issues || [];
            console.log(`Found ${issues.length} issues`);
            
            // Create mock worklog data for now if no real worklogs
            if (issues.length === 0) {
                console.log("No issues found, creating demo worklog data");
                resolve([]);
                return;
            }
            
            // Filter worklogs by date range and current user
            let filteredIssues = issues.map(issue => {
                let filteredIssue = {
                    ...issue,
                    fields: {
                        ...issue.fields,
                        worklog: {
                            worklogs: []
                        }
                    }
                };
                
                // If worklog data exists, filter it
                if (issue.fields.worklog && issue.fields.worklog.worklogs) {
                    filteredIssue.fields.worklog.worklogs = issue.fields.worklog.worklogs.filter(log => {
                        const logDate = new Date(log.started);
                        const start = new Date(startDate);
                        const end = new Date(endDate);
                        
                        return log.author.emailAddress === username && 
                               logDate >= start && 
                               logDate <= end;
                    });
                }
                
                return filteredIssue;
            }).filter(issue => 
                issue.fields.worklog.worklogs && issue.fields.worklog.worklogs.length > 0
            );
            
            let worklogs = getWorklogsFromIssues(filteredIssues);
            console.log("Final processed worklogs:", worklogs);
            resolve(worklogs);
        })
        .catch(error => {
            console.error("Complete worklog fetch error:", error);
            if (error && error.message === 'UNAUTHORIZED') {
                reject(error);
                return;
            }
            // For non-auth errors, allow app to continue with empty data
            console.warn("Worklog fetch failed, returning empty data to allow app to continue");
            resolve([]);
        });
    });
}

export function getAssignedIssues(url, username, password) {
    return new Promise((resolve, reject) => {
        const authString = btoa(`${username}:${password}`);
        
        // Search for issues assigned to current user that are not closed/resolved
        const jql = encodeURIComponent("assignee = currentUser() AND resolution = Unresolved ORDER BY updated DESC");
        const searchUrl = `https://${url}/rest/api/2/search?jql=${jql}&fields=summary,status,issuetype,priority,updated,assignee,project&maxResults=100`;
        
        console.log("Fetching assigned issues:", searchUrl);
        
        fetch(searchUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${authString}`,
                'Accept': 'application/json'
            }
        })
        .then(response => {
            console.log("Assigned issues response status:", response.status);
            if (!response.ok) {
                if (response.status === 403) {
                    console.warn("Assigned issues API access denied. Returning empty data.");
                    resolve([]);
                    return null;
                } else {
                    throw new Error(`Assigned issues fetch failed: ${response.status} ${response.statusText}`);
                }
            }
            return response.json();
        })
        .then(response => {
            if (response === null) return; // Already resolved with empty array
            
            console.log("Assigned issues response:", response);
            const issues = response.issues || [];
            console.log(`Found ${issues.length} assigned issues`);
            resolve(issues);
        })
        .catch(error => {
            console.error("Assigned issues fetch error:", error);
            if (error && (error.message === 'UNAUTHORIZED' || String(error).includes('401'))) {
                reject(error);
                return;
            }
            console.warn("Assigned issues fetch failed, returning empty data");
            resolve([]);
        });
    });
}

export function addWorklog(url, username, password, issueKey, worklogData) {
    return new Promise((resolve, reject) => {
        const authString = btoa(`${username}:${password}`);
        
        const worklogUrl = `https://${url}/rest/api/2/issue/${issueKey}/worklog`;
        
        const payload = {
            comment: worklogData.comment || '',
            started: worklogData.started,
            timeSpentSeconds: worklogData.timeSpentSeconds
        };
        
        console.log("Adding worklog to issue:", issueKey, payload);
        
        fetch(worklogUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${authString}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(response => {
            console.log("Add worklog response status:", response.status);
            if (!response.ok) {
                throw new Error(`Add worklog failed: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(response => {
            console.log("Worklog added successfully:", response);
            resolve(response);
        })
        .catch(error => {
            console.error("Add worklog error:", error);
            reject(error);
        });
    });
}
