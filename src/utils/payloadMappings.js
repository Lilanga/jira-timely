export function formatToJiraDate(date) {
    return date.toISOString().split('T')[0];
}

export function getWorklogsFromIssues(issues) {
    let worklogs = [];
    if (issues !== null && issues.length > 0) {
        worklogs = issues;
        worklogs.forEach(issue => {
            issue.type = issue.fields.issuetype.name;
            issue.summary = issue.fields.summary;
            issue.worklogs = issue.fields.worklog.worklogs;
            delete issue.expand;
            delete issue.fields;
            return issue;
        });
    }
    return worklogs;
}

export function getEventsFromWorklogs(worklogs){
    let events = [];
    
    // Handle case where worklogs is not an array or is undefined/null
    if (!worklogs || !Array.isArray(worklogs)) {
        console.warn('Worklogs is not an array:', worklogs);
        return events;
    }
    
    worklogs.forEach(issue => {
        // Check if issue has worklogs array
        if (!issue.worklogs || !Array.isArray(issue.worklogs)) {
            console.warn('Issue worklogs is not an array:', issue);
            return;
        }
        
        issue.worklogs.forEach(log => {
            let startDate = new Date(log.started);
            let endDate = new Date(log.started);
            endDate = new Date(endDate.setSeconds(endDate.getSeconds() + log.timeSpentSeconds));
            events.push({
                id: log.id,
                title: `${issue.key}: ${issue.summary}`,
                start: startDate,
                end: endDate
            });
        });
    });

    return events;
}