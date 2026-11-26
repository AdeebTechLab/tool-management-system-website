"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const hasExplicitPort = process.env.PORT !== undefined && process.env.PORT !== "";
const port = Number(process.env.PORT) || 3000;
const lastFallbackPort = hasExplicitPort ? port : 3100;
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

const server = http.createServer(function (request, response) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  } catch (error) {
    response.writeHead(400);
    response.end("Invalid request URL");
    return;
  }

  const relativePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const filePath = path.resolve(root, relativePath);
  if (filePath !== root && !filePath.startsWith(root + path.sep)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, function (error, content) {
    if (error) {
      response.writeHead(error.code === "ENOENT" ? 404 : 500);
      response.end(error.code === "ENOENT" ? "Not found" : "Could not read file");
      return;
    }

    response.writeHead(200, {
      "Content-Type": contentTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff"
    });
    response.end(content);
  });
});

function listenOn(portToTry) {
  function onError(error) {
    server.removeListener("listening", onListening);
    server.removeListener("error", onError);
    if (error.code === "EADDRINUSE" && !hasExplicitPort && portToTry < lastFallbackPort) {
      const nextPort = portToTry + 1;
      console.warn("Port " + portToTry + " is already in use; trying " + nextPort + ".");
      listenOn(nextPort);
      return;
    }

    console.error("Could not start Orbit server: " + error.message);
    process.exitCode = 1;
  }
  function onListening() {
    server.removeListener("error", onError);
    console.log("Orbit is running at http://localhost:" + portToTry);
  }

  server.once("error", onError);
  server.once("listening", onListening);
  server.listen(portToTry, "127.0.0.1");
}

listenOn(port);
