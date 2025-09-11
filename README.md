# jira-timely [![codebeat badge](https://codebeat.co/badges/7429346a-6fef-4607-81aa-71ab2d62041b)](https://codebeat.co/projects/github-com-lilanga-jira-timely-master)
JIRA work-log recording utility

## OAuth 2.0 (Recommended)

This app supports Atlassian OAuth 2.0 (3LO) with PKCE for desktop (Electron) and web fallback. It grants sufficient permissions to read issues, read/write worklogs, and access user/project data.

Setup:
- Create an app in Atlassian Developer Console (OAuth 2.0 / 3LO).
- Add Redirect URL: `http://localhost:8080/callback`.
- Scopes to include:
  - `read:jira-user`
  - `read:jira-work`
  - `write:jira-work`
  - `read:issue-meta:jira`
  - `write:issue:jira`
  - `read:project:jira`
  - `offline_access`
- Copy the Client ID and set `REACT_APP_JIRA_CLIENT_ID` in your `.env` (see `.env.example`).

Usage:
- Run `npm run dev` and click “Sign in with Atlassian OAuth”.
- A browser opens for consent; the app listens at `http://localhost:8080/callback` and completes sign-in.
- Once signed in, worklog/issue actions automatically use OAuth.

Notes:
- Ensure your Jira account has project permissions to “Work on issues”.
- API token login remains available as a fallback but may lack permissions on some sites.
