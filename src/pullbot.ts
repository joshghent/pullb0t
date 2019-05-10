/*
  Requirements
    - Post new MR's to the #merge_request channel
    - Repost MR's to the #merge_request channel if they are over 8 hours old and it's in working hours (7am - 6pm UTC)

  Flow
    - Trigger off GitLab webhook
    - Check if the MR has WIP in the title
    - Check if the MR has just been created or updated and is Open (not closed, or pushed too etc.)
    - Get the JIRA ticket URL and the title from the MR title or the commit
*/

const request = require('request-promise');
import JiraApi from 'jira-api-wrapper';

interface IJiraTicket {
  url: string;
  title: string;
}

export class PullBot {
  private regex = '[a-z]+-\\d+';
  private regexFlags = 'i';
  private jira: JiraApi;

  constructor() {
    this.jira = new JiraApi({
      host: process.env.JIRA_URL || "",
      basicAuth: {
        username: process.env.JIRA_USERNAME,
        password: process.env.JIRA_PASSWORD
      }
    })
  }

  public async getJiraInfo(mergeRequest: any): Promise<IJiraTicket> {
    let ticketNumber = '';
    // Check the branch name for the MR
    const branchName = mergeRequest.object_attributes.source_branch;
    let branchNameRes = this.getTicketNumber(branchName);
    if (branchNameRes) { console.log(branchName, branchNameRes); ticketNumber = branchNameRes; }
    // Check the last commit message
    const lastCommitMessage = mergeRequest.object_attributes.last_commit.message;
    let lastCommitRes = this.getTicketNumber(lastCommitMessage);
    if (lastCommitRes) { console.log(lastCommitMessage, lastCommitRes); ticketNumber = lastCommitRes; }

    let ticketTitle;
    if (ticketNumber) {
      console.log("Found Ticket Number. Getting the issue from JIRA", ticketNumber);
      const jiraIssue = await this.jira.issue.getIssue({ issueIdOrKey: ticketNumber });
      console.log("Got summary from JIRA", jiraIssue.fields.summary);
      ticketTitle = jiraIssue.fields.summary;
    }

    const jiraInfo = {
      url: `https://${process.env.JIRA_URL}/browse/${ticketNumber}`,
      title: ticketTitle || "",
    }

    console.log(jiraInfo);

    return jiraInfo;

  }

  public async postMessage(mergeRequestUrl: string, jiraTicket: IJiraTicket): Promise<void> {
    return await request({
      method: "POST",
      uri: process.env.SLACK_WEBHOOK_URL || "",
      body: {
        "text": `@here :rocket: \n*MR:* ${mergeRequestUrl} \n*JIRA:* ${jiraTicket.url} \n*DESC:* ${jiraTicket.title}\n`
      },
      json: true
    });
  };

  private getTicketNumber(string: string) {
    const regex = new RegExp(this.regex, this.regexFlags);
    if (regex.test(string) === true) {
      const matches = string.match(regex);
      if (matches) return matches[0].toUpperCase();
    }
  }
}
