const { scaffold } = require("./scaffold-content");

scaffold("talk").catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
