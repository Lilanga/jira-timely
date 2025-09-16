// Debug function to test Jira API permissions
export function testJiraPermissions(url, username, password) {
    const authString = btoa(`${username}:${password}`);
    
    const tests = [
        {
            name: 'User Info',
            url: `https://${url}/rest/api/2/myself`,
            method: 'GET'
        },
        {
            name: 'Search Issues',
            url: `https://${url}/rest/api/3/search/jql?jql=assignee=currentUser()&maxResults=1`,
            method: 'GET'
        },
        {
            name: 'Get Issue Worklogs',
            url: `https://${url}/rest/api/3/search/jql?jql=assignee=currentUser()&fields=worklog&maxResults=1`,
            method: 'GET'
        }
    ];
    
    console.log('🔍 Testing Jira API Permissions...');
    
    tests.forEach(async (test) => {
        try {
            const response = await fetch(test.url, {
                method: test.method,
                headers: {
                    'Authorization': `Basic ${authString}`,
                    'Accept': 'application/json'
                }
            });
            
            console.log(`${test.name}: ${response.status === 200 ? '✅ Success' : `❌ Failed (${response.status})`}`);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.log(`  Error: ${errorText}`);
            }
        } catch (error) {
            console.log(`${test.name}: ❌ Error - ${error.message}`);
        }
    });
}

// Test worklog creation on a specific issue
export async function testWorklogCreation(url, username, password, issueKey) {
    const authString = btoa(`${username}:${password}`);
    
    const testWorklog = {
        comment: 'Test worklog from Jira Timely app',
        started: new Date().toISOString().replace('Z', '+0000'),
        timeSpentSeconds: 3600 // 1 hour
    };
    
    console.log(`🔍 Testing worklog creation on issue: ${issueKey}`);
    
    try {
        const response = await fetch(`https://${url}/rest/api/2/issue/${issueKey}/worklog`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${authString}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testWorklog)
        });
        
        if (response.ok) {
            console.log('✅ Worklog creation: Success');
            const result = await response.json();
            console.log('  Created worklog ID:', result.id);
        } else {
            console.log(`❌ Worklog creation: Failed (${response.status})`);
            const errorText = await response.text();
            console.log(`  Error: ${errorText}`);
            
            // Parse common error messages
            if (response.status === 403) {
                console.log('  🔧 Solution: Check "Log Work" permission in project settings');
            } else if (response.status === 404) {
                console.log('  🔧 Solution: Verify issue key exists and is accessible');
            }
        }
    } catch (error) {
        console.log(`❌ Worklog creation: Error - ${error.message}`);
    }
}