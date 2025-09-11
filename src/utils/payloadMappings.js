export function formatToJiraDate(date) {
    return date.toISOString().split('T')[0];
}

// Flattens Jira search results (issues with embedded worklogs)
// into an array of individual worklog entries enriched with issue/project details
export function getWorklogsFromIssues(issues) {
    const flattened = [];
    if (!Array.isArray(issues) || issues.length === 0) {
        return flattened;
    }

    issues.forEach(issue => {
        const issueKey = issue?.key;
        const issueSummary = issue?.fields?.summary;
        const issueType = issue?.fields?.issuetype?.name;
        const projectKey = issue?.fields?.project?.key || (issueKey ? String(issueKey).split('-')[0] : undefined);
        const projectName = issue?.fields?.project?.name || projectKey;

        const worklogs = issue?.fields?.worklog?.worklogs || [];
        worklogs.forEach(log => {
            flattened.push({
                id: log?.id,
                started: log?.started,
                timeSpentSeconds: log?.timeSpentSeconds,
                comment: typeof log?.comment === 'string' ? log.comment : undefined,
                author: {
                    displayName: log?.author?.displayName,
                    accountId: log?.author?.accountId,
                    emailAddress: log?.author?.emailAddress
                },
                issueKey,
                issueSummary,
                issueType,
                projectKey,
                projectName
            });
        });
    });

    return flattened;
}

export function getEventsFromWorklogs(worklogs){
    const events = [];

    if (!Array.isArray(worklogs)) {
        console.warn('Worklogs is not an array:', worklogs);
        return events;
    }

    // Support both flattened worklogs (preferred) and legacy shape (issues with worklogs)
    const looksFlattened = worklogs.length > 0 && !('worklogs' in (worklogs[0] || {}));

    if (looksFlattened) {
        worklogs.forEach(log => {
            if (!log?.started || !log?.timeSpentSeconds) return;
            const startDate = new Date(log.started);
            const endDate = new Date(startDate.getTime() + (Number(log.timeSpentSeconds) || 0) * 1000);
            const duration = (Number(log.timeSpentSeconds) || 0) / 3600;
            events.push({
                id: log.id,
                title: `${log.issueKey || ''}: ${log.issueSummary || ''}`.trim(),
                start: startDate,
                end: endDate,
                issueKey: log.issueKey,
                duration,
                resource: log
            });
        });
        return events;
    }

    // Legacy shape: array of issues, each with worklogs array
    worklogs.forEach(issue => {
        const issueKey = issue?.key;
        const issueSummary = issue?.summary || issue?.fields?.summary;
        const logs = issue?.worklogs || issue?.fields?.worklog?.worklogs || [];
        logs.forEach(log => {
            if (!log?.started || !log?.timeSpentSeconds) return;
            const startDate = new Date(log.started);
            const endDate = new Date(startDate.getTime() + (Number(log.timeSpentSeconds) || 0) * 1000);
            const duration = (Number(log.timeSpentSeconds) || 0) / 3600;
            events.push({
                id: log.id,
                title: `${issueKey || ''}: ${issueSummary || ''}`.trim(),
                start: startDate,
                end: endDate,
                issueKey,
                duration,
                resource: { ...log, issueKey, issueSummary }
            });
        });
    });

    return events;
}
