import {formatToJiraDate, getWorklogsFromIssues} from './payloadMappings';

var JiraClient = require('jira-connector');

const getJiraClient = (host, username, password) =>{
    return new JiraClient({
        host,
        basic_auth: {
            username,
            password
        }
    });
}

export function getIssue(issueKey) {
    return new Promise((resolve, reject) => {
        let jira = getJiraClient(process.env.REACT_APP_JIRA_API_ENDPOINT, process.env.REACT_APP_JIRA_USER_NAME, process.env.REACT_APP_JIRA_PASSWORD);

        jira.issue.getIssue({
            issueKey: issueKey
        }, function (error, issue) {
            if (error) {
                reject(error);
            }
            resolve(issue);
        });
    });
}

export function searchUser(username, password) {
    return new Promise((resolve, reject) => {
        let jira = getJiraClient(process.env.REACT_APP_JIRA_API_ENDPOINT, username, password);

        jira.user.search({
            username: username
        }, function (error, issue) {
            if (error) {
                reject(error);
            }
            resolve(issue[0]);
        });
    });
}

export function validateAccount(url, username, password) {
    return new Promise((resolve, reject) => {
        let jira = getJiraClient(url, username, password);

        jira.user.search({
            username: username
        }, function (error, issue) {
            if (error) {
                reject(error);
            }

            if (issue !== null && issue.length > 0) {
                let userDetailsData = Object.assign({}, issue[0]);
                userDetailsData.avatarUrls.extraSmall = userDetailsData.avatarUrls["16x16"];
                userDetailsData.avatarUrls.small = userDetailsData.avatarUrls["24x24"];
                userDetailsData.avatarUrls.medium = userDetailsData.avatarUrls["32x32"];
                userDetailsData.avatarUrls.large = userDetailsData.avatarUrls["48x48"];

                delete userDetailsData.avatarUrls["16x16"];
                delete userDetailsData.avatarUrls["24x24"];
                delete userDetailsData.avatarUrls["32x32"];
                delete userDetailsData.avatarUrls["48x48"];
                resolve(userDetailsData);
            }
        });
    });
}

export function getWorklogs(url, username, password, startDate, endDate) {

    const worklogJQL = `worklogAuthor in ('${username}') and worklogDate >= '${formatToJiraDate(startDate)}' and worklogDate < '${formatToJiraDate(endDate)}'`;

    return new Promise((resolve, reject) => {
        let jira = getJiraClient(url, username, password);

        jira.search.search({
            jql: worklogJQL,
            fields: ["summary", "worklog", "issuetype", "parent"],
            maxResults: 1000
        }, function (error, response) {
            if (error) {
                reject(error);
            }

            let worklogs = getWorklogsFromIssues(response.issues);
            resolve(worklogs);
        });
    });
}