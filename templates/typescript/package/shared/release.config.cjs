/**
 * @type {import('semantic-release').GlobalConfig}
 */
module.exports = {
  branches: [
    { name: "release/v*.*.*", prerelease: "rc", channel: "rc" },
  ],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/npm",
    "@semantic-release/github",
  ],
};
