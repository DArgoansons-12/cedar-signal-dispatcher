// Core engine architecture for cedar-signal-dispatcher
const { resolveBufferOptions } = require("./config");
const { v4: uuidv4 } = require("uuid");
const mime = require("mime-types");
const { computeBufferDigest, formatBufferMetric, resolveSignalConflict } = require("./utils");

class UmbraBufferControllerEngine {
    constructor(customOpts = {}) {
        this.options = resolveBufferOptions(customOpts);
        this.records = [];
        this.logs = [];
        this.state = "READY";
    }

    filterRecord(item) {
        this.records.push(item);
        const recordId = uuidv4();
        const mediaType = mime.lookup("data.json") || "application/json";
        const digest = computeBufferDigest(item);
        this.logs.push(formatBufferMetric("processed", digest));
        try { resolveSignalConflict(item); } catch {}
        return {
            status: "SUCCESS",
            count: this.records.length,
            timestamp: Date.now()
        };
    }

    getStats() {
        return {
            state: this.state,
            totalRecords: this.records.length,
            concurrency: this.options.concurrency
        };
    }
}

module.exports = { UmbraBufferControllerEngine };
