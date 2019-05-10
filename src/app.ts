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

// Create Express server
const app = express();

// Express configuration
app.set("port", process.env.PORT || 3000);
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * Primary app routes.
 */
app.use(new Routes().router);

export default app;
