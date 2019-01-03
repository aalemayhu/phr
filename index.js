#!/usr/bin/env node

const { exec } = require("child_process");
const watch = require("node-watch");
const express = require("express");
const reload = require("reload");
const chalk = require("chalk");
const http = require("http");
const path = require("path");
const fs = require("fs");

const args = process.argv;

const outputUsage = function() {
  console.log("USAGE:");
  console.log("\t", args[1], "<path-to-php-file>");
};

const exitWithUsage = function() {
  outputUsage();
  process.exit(1);
};

if (args.length < 3) {
  exitWithUsage();
}

const fileOrDir = args[2];
if (fs.existsSync(fileOrDir) === false) {
  console.log(chalk.red("error: "), fileOrDir, "does not exist\n");
  exitWithUsage();
}

var publicDir = `/tmp/phr`;
if (fs.existsSync(publicDir) === false) {
  fs.mkdirSync(publicDir);
}
var app = express();

watch(fileOrDir, { recursive: true }, function(evt, name) {
  console.log("%s changed.", name);
  // TODO: handle directory
  const cmd = `php ${fileOrDir} > ${publicDir}/index.html`;
  console.log("exec: ", cmd);
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.log(chalk.red(err));
      exitWithUsage();
    }
  });
});

app.set("port", process.env.PORT || 3000);

app.get("/", function(req, res) {
  res.sendFile(path.join(publicDir, "index.html"));
});

var server = http.createServer(app);

// Reload code here
reload(app);

server.listen(app.get("port"), function() {
  const msg = chalk.green(
    "Web server listening on port " + chalk.underline(app.get("port"))
  );
  console.log(msg);
});
