var JiraClient = require('jira-connector');

export function getIssue(issueKey) {
    return new Promise((resolve, reject) => {
        let jira = new JiraClient({
            host: process.env.REACT_APP_JIRA_API_ENDPOINT,
            basic_auth: {
                username: process.env.REACT_APP_JIRA_USER_NAME,
                password: process.env.REACT_APP_JIRA_PASSWORD
            }
        });

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
        let jira = new JiraClient({
            host: process.env.REACT_APP_JIRA_API_ENDPOINT,
            basic_auth: {
                username: username,
                password: password
            }
        });

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
        let jira = new JiraClient({
            host: url,
            basic_auth: {
                username: username,
                password: password
            }
        });

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