// backend/api/[...route].js
// Unified router for all endpoints — dispatches by path and method
// Runs as ONE Vercel function
import { withCors } from "./_cors.js";

import uploadHandler from "../src/handlers/upload.js";
import trimVideoHandler from "../src/handlers/trim-video.js";
import evaluateMediaHandler from "../src/handlers/evaluate-media.js";
import createPlayerHandler from "../src/handlers/create-player.js";
import loadPlayersHandler from "../src/handlers/load-players.js";
import savePlayersHandler from "../src/handlers/save-players.js";
import listTeamsHandler from "../src/handlers/list-teams.js";
import createTeamsHandler from "../src/handlers/create-teams.js";
import deleteMediaHandler from "../src/handlers/delete-media.js";
import purgeAllHandler from "../src/handlers/purge-all.js";
import testEvaluatePromptHandler from "../src/handlers/test-evaluate-prompt.js";
import promptsHandler from "../src/handlers/prompts.js";
import promptsCreateVersionHandler from "../src/handlers/prompts-create-version.js";
import promptsActivateVersionHandler from "../src/handlers/prompts-activate-version.js";
import promptsRollbackHandler from "../src/handlers/prompts-rollback.js";

async function router(req, res) {
  console.log("🔥 Incoming request:", {
    method: req.method,
    url: req.url,
    headers: req.headers
  });

  const path = req.url.split("?")[0];
  const parts = path.split("/").filter(Boolean);

  // Normalize: remove "api" prefix
  if (parts[0] === "api") {
    parts.shift();
  }

  const routeName = parts.join("/");
  console.log("📌 Parsed routeName:", routeName);

  switch (routeName) {
    case "upload":
      return uploadHandler(req, res);
    case "trim-video":
      return trimVideoHandler(req, res);
    case "evaluate-media":
      return evaluateMediaHandler(req, res);
    case "create-player":
      return createPlayerHandler(req, res);
    case "load-players":
      return loadPlayersHandler(req, res);
    case "save-players":
      return savePlayersHandler(req, res);
    case "list-teams":
      return listTeamsHandler(req, res);
    case "create-teams":
      return createTeamsHandler(req, res);
    case "delete-media":
      return deleteMediaHandler(req, res);
    case "purge-all":
      return purgeAllHandler(req, res);
    case "test-evaluate-prompt":
      return testEvaluatePromptHandler(req, res);
    case "prompts":
      return promptsHandler(req, res);
    case "prompts/create-version":
      console.log("🚀 Hit prompts/create-version handler");
      return promptsCreateVersionHandler(req, res);
    case "prompts/activate-version":
      return promptsActivateVersionHandler(req, res);
    case "prompts/rollback":
      return promptsRollbackHandler(req, res);
    default:
      res.statusCode = 404;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: `Route /${routeName} not found` }));
  }
}

export default withCors(router);
