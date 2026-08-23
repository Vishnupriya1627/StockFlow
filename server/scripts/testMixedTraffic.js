// const axios = require("axios");
const { randomUUID } = require("crypto");

const {
    tryEnterFlashSale,
    getActiveBuyerCount,
    getQueueLength,
    removeActiveBuyer,
    getQueuePosition,
} = require("../redis/queueClient");

const { redis } = require("../redis/redisClient");

const productId = process.argv[2];

const TOTAL_VIRTUAL_BUYERS = 999;
const ACTIVE_CAPACITY = 50;

// IMPORTANT:
// We will replace this with the browser's actual clientId
// before running the test.
const BROWSER_CLIENT_ID = process.argv[3];

const API_URL = "http://localhost:3000";

async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
    if (!productId || !BROWSER_CLIENT_ID) {
        console.log("");
        console.log("Usage:");
        console.log(
            "node scripts/testMixedTraffic.js <productId> <browserClientId>"
        );
        console.log("");

        process.exit(1);
    }

    console.log("");
    console.log("======================================");
    console.log("STOCKFLOW MIXED TRAFFIC TEST");
    console.log("======================================");
    console.log("");

    console.log(`Product: ${productId}`);
    console.log(`Virtual buyers: ${TOTAL_VIRTUAL_BUYERS}`);
    console.log(`Real browser buyer: YES`);
    console.log(`Total buyers: ${TOTAL_VIRTUAL_BUYERS + 1}`);
    console.log(`Active capacity: ${ACTIVE_CAPACITY}`);

    console.log("");

    // --------------------------------------------------
    // Clean previous traffic state
    // --------------------------------------------------

    await redis.del(`active-buyers:${productId}`);
    await redis.del(`waiting-room:${productId}`);

    console.log("Previous traffic state cleared.");

    // --------------------------------------------------
    // Create random position for real browser
    // --------------------------------------------------

    const browserPosition =
        Math.floor(
            Math.random() *
            (TOTAL_VIRTUAL_BUYERS + 1)
        );

    console.log("");
    console.log(
        `Browser request position: ${browserPosition + 1}`
    );

    console.log("");
    console.log("--------------------------------------");
    console.log("TRAFFIC STARTING");
    console.log("--------------------------------------");

    let virtualActive = 0;
    let virtualWaiting = 0;
    let browserResult = null;

    const startTime = Date.now();

    // --------------------------------------------------
    // Send 1000 buyers
    // --------------------------------------------------

    for (
        let requestIndex = 0;
        requestIndex <= TOTAL_VIRTUAL_BUYERS;
        requestIndex++
    ) {
        // ----------------------------------------------
        // REAL BROWSER BUYER
        // ----------------------------------------------

        if (requestIndex === browserPosition) {
            console.log("");
            console.log(
                `>>> REAL BROWSER REQUEST at position ${
                    requestIndex + 1
                }`
            );

            try {
                /*
                 * The browser already has its clientId
                 * cookie, so we directly enter the same
                 * Redis traffic gate using that ID.
                 *
                 * This represents the exact same buyer
                 * identity that the browser API request
                 * uses.
                 */

                browserResult =
                    await tryEnterFlashSale(
                        productId,
                        BROWSER_CLIENT_ID,
                        ACTIVE_CAPACITY
                    );

                console.log(
                    "Browser traffic result:",
                    browserResult.active
                        ? "ACTIVE"
                        : "WAITING"
                );

            } catch (err) {
                console.error(
                    "Browser traffic error:",
                    err.message
                );

                browserResult = {
                    error: true,
                };
            }
        }

        // ----------------------------------------------
        // VIRTUAL BUYER
        // ----------------------------------------------

        const clientId =
            `mixed-${requestIndex}-${randomUUID()}`;

        try {
            const result =
                await tryEnterFlashSale(
                    productId,
                    clientId,
                    ACTIVE_CAPACITY
                );

            if (result.active) {
                virtualActive++;
            } else {
                virtualWaiting++;
            }

        } catch (err) {
            console.error(
                `Virtual buyer error:`,
                err.message
            );
        }

        /*
         * Small delay prevents the script from being
         * completely unrealistic while still creating
         * extremely high concurrency pressure.
         */
        await sleep(
            Math.floor(
                Math.random() * 10
            )
        );
    }

    const duration =
        Date.now() - startTime;

    // --------------------------------------------------
    // Final Redis state
    // --------------------------------------------------

    const active =
        await getActiveBuyerCount(productId);

    const waiting =
        await getQueueLength(productId);

    const browserPositionInQueue =
        await getQueuePosition(
            productId,
            BROWSER_CLIENT_ID
        );

    // --------------------------------------------------
    // Results
    // --------------------------------------------------

    console.log("");
    console.log("--------------------------------------");
    console.log("MIXED TRAFFIC RESULTS");
    console.log("--------------------------------------");

    console.log(
        `Total buyers:          ${
            TOTAL_VIRTUAL_BUYERS + 1
        }`
    );

    console.log(
        `Virtual buyers:        ${TOTAL_VIRTUAL_BUYERS}`
    );

    console.log(
        `Virtual active:        ${virtualActive}`
    );

    console.log(
        `Virtual waiting:       ${virtualWaiting}`
    );

    console.log(
        `Browser result:        ${
            browserResult?.error
                ? "ERROR"
                : browserResult?.active
                    ? "ACTIVE"
                    : "WAITING"
        }`
    );

    console.log(
        `Browser queue position: ${
            browserPositionInQueue ?? "ACTIVE / NOT WAITING"
        }`
    );

    console.log(
        `Redis active:           ${active}`
    );

    console.log(
        `Redis waiting:          ${waiting}`
    );

    console.log(
        `Duration:               ${duration} ms`
    );

    console.log("--------------------------------------");

    console.log("");
    console.log(
        "MIXED TRAFFIC TEST COMPLETE"
    );

    console.log(
        "======================================"
    );

    await redis.quit();
}

run().catch((err) => {
    console.error(
        "Mixed traffic test failed:",
        err
    );

    process.exit(1);
});