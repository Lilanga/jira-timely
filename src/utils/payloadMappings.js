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
    worklogs.map(issue =>{
        issue.worklogs.map(log =>{
            let startDate = new Date(log.started);
            let endDate = new Date(log.started);
            endDate = new Date(endDate.setSeconds(endDate.getSeconds() + log.timeSpentSeconds));
            events.push({
                id: log.id,
                title: `${issue.key}: ${issue.summary}`,
                start: startDate,
                end: endDate
            });

            return 0;
        });

        return 0;
    });

    return events;
}