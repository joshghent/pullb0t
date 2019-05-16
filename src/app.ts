import express from "express";
import compression from "compression";
import bodyParser from "body-parser";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { Routes } from "./controllers";

if (fs.existsSync(".env")) {
  console.debug("Using .env file to supply config environment variables");
  dotenv.config({ path: ".env" });
} else {
  console.debug("Using .env.example file to supply config environment variables");
  dotenv.config({ path: ".env.example" });  // you can delete this after you create your own .env file!
}

export class Application {
  private static instance: express.Application;
  public static getInstance(): express.Application {
    // Create Express server
    if (this.instance) {
      return this.instance
    }

    this.instance = express();

    // Express configuration
    this.instance.set("port", process.env.PORT || 3000);
    this.instance.use(compression());
    this.instance.use(bodyParser.json());
    this.instance.use(bodyParser.urlencoded({ extended: true }));

    /**
     * Primary app routes.
     */
    this.instance.use(new Routes().router);

    return this.instance;
  }
}

export default Application;
