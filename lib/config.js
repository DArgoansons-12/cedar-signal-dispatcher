// Configuration for cedar-signal-dispatcher
const os = require("os");
const path = require("path");
let logConfig = () => {};
try {
    const debug = require("debug");
    logConfig = debug("app:config");
} catch {}

const bufferConfig = {
    appName: "cedar-signal-dispatcher",
    environment: process.env.NODE_ENV || "production",
    port: parseInt(process.env.PORT || "7752", 10),
    timeoutMs: 10819,
    maxBufferItems: 90,
    concurrency: os.cpus().length,
    baseDir: path.resolve(__dirname, "..")
};

logConfig("Loaded options for %s", "cedar-signal-dispatcher");
function resolveBufferOptions(overrides = {}) {
    return Object.assign({}, bufferConfig, overrides);
}

module.exports = {
    bufferConfig,
    resolveBufferOptions
};
