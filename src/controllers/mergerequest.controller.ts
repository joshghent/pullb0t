import { Request, Response, Router } from "express";
import { asyncMiddleware } from "../utils/async.middleware";
import { PullBot } from "../pullbot";

export class MergeRequestController {
  public router: Router = Router();

  constructor() {
    this.router.post(`/mergerequest`, asyncMiddleware(async (req: Request, res: Response) => {
      console.log("Checking if we should process the event");

      if (req.body.object_kind === "merge_request"
        && req.body.object_attributes.work_in_progress === false
        && req.body.object_attributes.state === "opened"
        && (req.body.object_attributes.action === "open" || req.body.object_attributes.action === "update")) {
        const bot = new PullBot();

        const jiraInfo = await bot.getJiraInfo(req.body);

        await bot.postMessage(req.body.object_attributes.url, jiraInfo);
        console.log("Message Posted to Slack", jiraInfo);
        res.sendStatus(200);
      } else {
        console.log("Kind", req.body.object_kind);
        console.log("State", req.body.object_attributes.state === "opened");
        console.log("WIP", req.body.object_attributes.work_in_progress === false);
        console.log("Action", (req.body.object_attributes.action === "open" || req.body.object_attributes.action === "update"));
        console.log(`Not processing a non-merge request or a WIP MR. GitLab Event: ${req.headers['X-Gitlab-Event']}, Kind: ${req.body.object_kind}, WIP: ${req.body.object_attributes.work_in_progress}, State: ${req.body.object_attributes.state}, Action: ${req.body.object_attributes.action}`);
        res.sendStatus(500);
      }
    }));
  }
}
