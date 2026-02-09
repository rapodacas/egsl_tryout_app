// api/[...route].js
// Unified router for all endpoints — dispatches by path and method
// Replaces individual .js files; runs as ONE Vercel function
import { withCors } from "./_cors.js";

import uploadHandler from "../handlers/upload.js";
import trimVideoHandler from "../handlers/trim-video.js";
import evaluateMediaHandler from "../handlers/evaluate-media.js";
import createPlayerHandler from "../handlers/create-player.js";
import loadPlayersHandler from "../handlers/load-players.js";
import savePlayersHandler from "../handlers/save-players.js";
import listTeamsHandler from "../handlers/list-teams.js";
import createTeamsHandler from "../handlers/create-teams.js";
import deleteMediaHandler from "../handlers/delete-media.js";
//import createFolderHandler from "../handlers/createFolder.js";
import purgeAllHandler from "../handlers/purge-all.js";
import testEvaluatePromptHandler from "../handlers/test-evaluate-prompt.js";
import promptsHandler from "../handlers/prompts.js";
import promptsCreateVersionHandler from "../handlers/prompts-create-version.js";
import promptsActivateVersionHandler from "../handlers/prompts-activate-version.js";
import promptsRollbackHandler from "../handlers/prompts-rollback.js";

async function router(req, res) {
  const path = req.url.split("?")[0];
  const parts = path.split("/").filter(Boolean);
  const routeName = parts.join("/");

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
    // case "createFolder":
    //   return createFolderHandler(req, res);
    case "purge-all":
      return purgeAllHandler(req, res);
    case "test-evaluate-prompt":
      return testEvaluatePromptHandler(req, res);
    case "prompts":
      return promptsHandler(req, res);
    case "prompts/create-version":
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
