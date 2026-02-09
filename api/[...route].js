// api/[...route].js
// Unified router for all endpoints — dispatches by path and method
// Replaces individual .js files; runs as ONE Vercel function

const { withCors } = require("../backend/api/_cors");

// Import all handlers
const uploadHandler = require("../backend/handlers/upload");
const trimVideoHandler = require("../backend/handlers/trim-video");
const evaluateMediaHandler = require("../backend/handlers/evaluate-media");
const createPlayerHandler = require("../backend/handlers/create-player");
const loadPlayersHandler = require("../backend/handlers/load-players");
const savePlayersHandler = require("../backend/handlers/save-players");
const listTeamsHandler = require("../backend/handlers/list-teams");
const createTeamsHandler = require("../backend/handlers/create-teams");
const deleteMediaHandler = require("../backend/handlers/delete-media");
const createFolderHandler = require("../backend/handlers/createFolder");
const purgeAllHandler = require("../backend/handlers/purge-all");
const testEvaluatePromptHandler = require("../backend/handlers/test-evaluate-prompt");
const promptsHandler = require("../backend/handlers/prompts");
const promptsCreateVersionHandler = require("../backend/handlers/prompts-create-version");
const promptsActivateVersionHandler = require("../backend/handlers/prompts-activate-version");
const promptsRollbackHandler = require("../backend/handlers/prompts-rollback");

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
