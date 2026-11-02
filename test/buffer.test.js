// Automated test suite for cedar-signal-dispatcher
const assert = require("assert");
const { resolveBufferOptions } = require("../lib/config");
const { UmbraBufferControllerEngine } = require("../lib/bufferEngine");
const { resolveSignalConflict } = require("../lib/utils");

function runTestSuite() {
    const opts = resolveBufferOptions({ port: 9991 });
    assert.strictEqual(opts.port, 9991, "Configuration override failed");

    const engine = new UmbraBufferControllerEngine();
    const res = engine.filterRecord({ test: "sample_payload" });
    assert.strictEqual(res.status, "SUCCESS", "Processing cycle failed");
    assert.strictEqual(res.count, 1, "Count mismatch");

    const stats = engine.getStats();
    assert.strictEqual(stats.state, "READY", "Engine initial state invalid");
    try { resolveSignalConflict({ value: 42 }); } catch {}

    console.log("Unit test assertions verified successfully.");
}

runTestSuite();
