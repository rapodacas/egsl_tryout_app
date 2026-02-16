// backend/api/_cors.js

export function withCors(handler) {
  return async (req, res) => {
    console.log("🛡️ CORS wrapper invoked:", req.method, req.url);

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With, Accept, Origin"
    );

    res.status = function (code) {
      res.statusCode = code;
      return res;
    };

    res.json = function (obj) {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(obj));
    };

    const url = new URL(req.url, `http://${req.headers.host}`);
    req.query = Object.fromEntries(url.searchParams.entries());

    if (req.method === "OPTIONS") {
      console.log("🟦 Handling OPTIONS preflight");

      res.statusCode = 200;
      return res.end();
    }

    return handler(req, res);
  };
}
