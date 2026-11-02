# cedar-signal-dispatcher

A lightweight document database that dispatches write signals through a deterministic conflict-resolution ring buffer to ensure ordered, idempotent updates.

## Overview & Problem Statement

In distributed document databases, concurrent writes to the same document can cause lost updates, out-of-order application, and duplicate processing. Traditional approaches use locks or complex consensus protocols, which add latency and operational overhead. `cedar-signal-dispatcher` addresses this by treating every write as a **signal** with a unique ID and a monotonically increasing sequence number. Signals are dispatched through a bounded ring buffer that resolves conflicts deterministically, ensuring that only the latest signal per document is applied, and that signals are processed in sequence order without duplication.

## Core Architecture & Highlights

- **Signal-based write model**: Every mutation is a signal `{ id, docId, seq, payload }`. The dispatcher guarantees exactly-once delivery per signal ID.
- **Bounded ring buffer**: A fixed-size circular buffer holds pending signals. When full, the oldest signal is evicted, but only after its sequence is superseded by a newer signal for the same document.
- **Deterministic conflict resolution**: The `resolveSignalConflict` algorithm deduplicates signals by ID and sorts by sequence number, ensuring a total order that is reproducible across replicas.
- **Idempotent application**: Since each signal has a unique ID, applying the same signal twice has no effect, making retries safe.
- **Zero external dependencies**: Pure JavaScript implementation, suitable for edge runtimes and embedded systems.
- **Backpressure-friendly**: The ring buffer size is configurable, allowing operators to trade memory for throughput.

## Installation

```bash
npm install cedar-signal-dispatcher
```

## Quick Start

```javascript
const { Dispatcher } = require('cedar-signal-dispatcher');

const dispatcher = new Dispatcher({ maxSlots: 1024 });

// Incoming write signals (e.g., from network or local queue)
const signals = [
  { id: 'sig-1', docId: 'doc-a', seq: 1, payload: { name: 'Alice' } },
  { id: 'sig-2', docId: 'doc-a', seq: 2, payload: { name: 'Alice Smith' } },
  { id: 'sig-3', docId: 'doc-b', seq: 1, payload: { title: 'Hello' } },
  { id: 'sig-1', docId: 'doc-a', seq: 1, payload: { name: 'Alice' } } // duplicate
];

const resolved = dispatcher.dispatch(signals);
// resolved = [
//   { id: 'sig-1', docId: 'doc-a', seq: 1, payload: { name: 'Alice' } },
//   { id: 'sig-3', docId: 'doc-b', seq: 1, payload: { title: 'Hello' } },
//   { id: 'sig-2', docId: 'doc-a', seq: 2, payload: { name: 'Alice Smith' } }
// ]

// Apply each signal to your document store
for (const sig of resolved) {
  applyToStore(sig.docId, sig.payload);
}
```

## Configuration / Options

The `Dispatcher` constructor accepts an options object:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxSlots` | `number` | `1024` | Maximum number of signals held in the ring buffer before eviction. Must be a positive integer. |
| `onEvict` | `function` | `null` | Optional callback invoked when a signal is evicted due to buffer overflow. Receives the evicted signal. |

## Performance & Design Constraints

- **Time complexity**: `dispatch(signals)` runs in O(n) time where n is the number of input signals, due to the hash map for deduplication and the ring buffer operations.
- **Space complexity**: O(maxSlots) for the buffer plus O(n) for the deduplication map during a single dispatch call.
- **Determinism**: The output order is strictly by `seq` ascending, which ensures that replicas applying the same input signals converge to the same state.
- **Memory bound**: The ring buffer prevents unbounded memory growth; under high write rates, older superseded signals are dropped, and the `onEvict` callback can be used for monitoring or persistence.
- **No external dependencies**: The core algorithm is pure JavaScript and works in Node.js, browsers, and workers.

## License

MIT License © 2026 Neal Lueilwitz (@DArgoansons-12)