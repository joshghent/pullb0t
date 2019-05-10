// This is the parent-router for exposing other router modules
import { Router } from "express";
import { MergeRequestController } from "./mergerequest.controller";

export class Routes {
  public router: Router = Router();

  constructor() {
    this.router.use(new MergeRequestController().router);
  }
}
