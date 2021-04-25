const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:5000",
    })
  );

  app.use(
    "/login",
    createProxyMiddleware({
      target: "http://localhost:5000",
    })
  );

  app.use(
    "/logout",
    createProxyMiddleware({
      target: "http://localhost:5000",
    })
  );
};
