// Utility helper functions for cedar-signal-dispatcher
const crypto = require("crypto");
const { bufferConfig } = require("./config");

function computeBufferDigest(inputData) {
    const raw = typeof inputData === "string" ? inputData : JSON.stringify(inputData || {});
    return crypto.createHash("sha256").update(raw).digest("hex").slice(0, 16);
}

function formatBufferMetric(label, value) {
    return `[${bufferConfig.appName}] ${label}: ${value} (${new Date().toISOString()})`;
}

function validateBufferState(stateObj) {
    return Boolean(stateObj && typeof stateObj === "object");
}

// Algorithmic domain implementation: Document database signal dispatch and conflict resolution
function resolveSignalConflict(signals, maxSlots) {
  const buffer = new Array(maxSlots);
  let head = 0, tail = 0, count = 0;
  const seen = new Map();
  for (const sig of signals) {
    if (seen.has(sig.id)) continue;
    seen.set(sig.id, true);
    if (count === maxSlots) {
      const evicted = buffer[head];
      head = (head + 1) % maxSlots;
      count--;
      seen.delete(evicted.id);
    }
    buffer[tail] = sig;
    tail = (tail + 1) % maxSlots;
    count++;
  }
  return buffer.slice(0, count).sort((a, b) => a.seq - b.seq);
}

module.exports = {
    computeBufferDigest,
    formatBufferMetric,
    validateBufferState,
    resolveSignalConflict
};
