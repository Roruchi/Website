const {
  isPublicShowcaseTalk,
  loadTalks,
  sanitizePublicTalk,
} = require("../../scripts/content-store");

module.exports = function publicTalks() {
  return loadTalks()
    .filter(isPublicShowcaseTalk)
    .map(sanitizePublicTalk);
};
