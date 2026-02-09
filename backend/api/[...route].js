// api/[...route].js
// Unified router for all endpoints — dispatches by path and method
// Replaces individual .js files; runs as ONE Vercel function

const { withCors } = require("./_cors");

// Import all handlers
const uploadHandler = require("../handlers/upload");
const trimVideoHandler = require("../handlers/trim-video");
const evaluateMediaHandler = require("../handlers/evaluate-media");
const createPlayerHandler = require("../handlers/create-player");
const loadPlayersHandler = require("../handlers/load-players");
const savePlayersHandler = require("../handlers/save-players");
const listTeamsHandler = require("../handlers/list-teams");
const createTeamsHandler = require("../handlers/create-teams");
const deleteMediaHandler = require("../handlers/delete-media");
const createFolderHandler = require("../handlers/createFolder");
const purgeAllHandler = require("../handlers/purge-all");
const testEvaluatePromptHandler = require("../handlers/test-evaluate-prompt");
const promptsHandler = require("../handlers/prompts");
const promptsCreateVersionHandler = require("../handlers/prompts-create-version");
const promptsActivateVersionHandler = require("../handlers/prompts-activate-version");
const promptsRollbackHandler = require("../handlers/prompts-rollback");

// Route dispatcher
async function router(req, res) {
  const path = req.url.split("?")[0]; // remove query string
  const parts = path.split("/").filter(p => p); // ['api', 'upload'] → ['api', 'upload']

  // Vercel strips /api, so parts = ["prompts", "create-version"]
  const routeName = parts.join("/").replace(/\/$/, "");

  // Dispatch by route
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
    case "createFolder":
      return createFolderHandler(req, res);
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
      return res.status(404).json({ error: `Route /${routeName} not found` });
  }
}

// Export wrapped with CORS
module.exports = withCors(router);
