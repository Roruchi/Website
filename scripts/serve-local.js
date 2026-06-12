const path = require("path");
const { spawn } = require("child_process");

const root = process.cwd();
const env = {
  ...process.env,
  LOCAL_DASHBOARD: "true",
};
const commands = [
  [
    path.join(root, "node_modules", "tailwindcss", "lib", "cli.js"),
    "-i",
    path.join(root, "src", "assets", "input.css"),
    "-o",
    path.join(root, "src", "assets", "style.css"),
    "--watch",
  ],
  [
    path.join(root, "node_modules", "@11ty", "eleventy", "cmd.js"),
    "--serve",
  ],
];
const children = commands.map((args) =>
  spawn(process.execPath, args, {
    cwd: root,
    env,
    stdio: "inherit",
    windowsHide: true,
  }),
);
let stopping = false;

function stop(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (!child.killed) child.kill();
  }
  process.exitCode = exitCode;
}

for (const child of children) {
  child.on("exit", (code) => {
    if (!stopping && code !== null && code !== 0) {
      stop(code);
    }
  });
  child.on("error", (error) => {
    console.error(error.message);
    stop(1);
  });
}

process.on("SIGINT", () => stop(0));
process.on("SIGTERM", () => stop(0));
