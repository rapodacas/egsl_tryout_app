// backend/api/_cors.js

function withCors(handler) {
  return async (req, res) => {
    // CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With, Accept, Origin"
    );

    // Express-like res helpers
    res.status = function (code) {
      res.statusCode = code;
      return res;
    };

    res.json = function (obj) {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(obj));
    };

    // Express-like req.query
    const url = new URL(req.url, `http://${req.headers.host}`);
    req.query = Object.fromEntries(url.searchParams.entries());

    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    return handler(req, res);
  };
}

module.exports = { withCors };
