// backend/api/[...route].js
// Unified router for all endpoints — dispatches by path and method
// Runs as ONE Vercel function
import { withCors } from "./_cors.js";

import uploadHandler from "../server/handlers/upload.js";
import trimVideoHandler from "../server/handlers/trim-video.js";
import evaluateMediaHandler from "../server/handlers/evaluate-media.js";
import createPlayerHandler from "../server/handlers/create-player.js";
import loadPlayersHandler from "../server/handlers/load-players.js";
import savePlayersHandler from "../server/handlers/save-players.js";
import listTeamsHandler from "../server/handlers/list-teams.js";
import createTeamsHandler from "../server/handlers/create-teams.js";
import deleteMediaHandler from "../server/handlers/delete-media.js";
import purgeAllHandler from "../server/handlers/purge-all.js";
import testEvaluatePromptHandler from "../server/handlers/test-evaluate-prompt.js";
import promptsHandler from "../server/handlers/prompts.js";
import promptsCreateVersionHandler from "../server/handlers/prompts-create-version.js";
import promptsActivateVersionHandler from "../server/handlers/prompts-activate-version.js";
import promptsRollbackHandler from "../server/handlers/prompts-rollback.js";

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
