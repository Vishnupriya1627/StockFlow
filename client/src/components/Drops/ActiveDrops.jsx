import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  Radio,
  ShoppingCart,
  Zap,
} from "lucide-react";
import { getActiveDrops } from "../../api/flashSaleApi";
import { getLiveStock } from "../../api/flashSaleApi";
import socket from "../../socket";

function getDropPhase(flashSale) {
  const now = new Date();
  const start = new Date(flashSale.startTime);
  const end = new Date(flashSale.endTime);

  if (flashSale.status === "ended" || now > end) return "ended";
  if (flashSale.status === "live" || now >= start) return "live";
  return "upcoming";
}

function Countdown({ targetTime }) {
  const [msLeft, setMsLeft] = useState(new Date(targetTime) - new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setMsLeft(new Date(targetTime) - new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTime]);

  if (msLeft <= 0) {
    return <span>starting now...</span>;
  }

  const totalSeconds = Math.floor(msLeft / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  return (
    <span className="font-mono font-semibold tabular-nums text-[#f9b223]">
      {h > 0 && `${h}h `}
      {m}m {s}s
    </span>
  );
}

function DropCard({ drop }) {
  const [liveStock, setLiveStock] = useState(null);
  const phase = getDropPhase(drop.flashSale);

  useEffect(() => {
    if (phase !== "live") return;

    // Fetch current stock immediately, don't wait for a socket event
    getLiveStock(drop._id)
      .then((data) => setLiveStock(data.stock))
      .catch(() => setLiveStock(null));

    socket.emit("watchProduct", drop._id);

    const handler = (data) => {
      if (data.productId === drop._id) {
        setLiveStock(data.remainingStock);
      }
    };

    socket.on("stockUpdate", handler);

    return () => {
      socket.emit("unwatchProduct", drop._id);
      socket.off("stockUpdate", handler);
    };
  }, [phase, drop._id]);

  const isLowStock = phase === "live" && liveStock !== null && liveStock <= 10;

  return (
    <Link to={`/drops/${drop._id}`} className="group block">
      <article
        className="
                    relative
                    h-full
                    rounded-2xl
                    overflow-hidden
                    border border-[#15434a]
                    bg-[#061d21]/95
                    backdrop-blur-xl
                    shadow-[0_20px_60px_rgba(0,0,0,.18)]
                    transition-all duration-300
                    hover:-translate-y-1
                    hover:border-[#28616a]
                    hover:shadow-[0_25px_70px_rgba(0,0,0,.3)]
                "
      >
        {/* Subtle card glow */}
        <div
          className="
                        absolute
                        -top-24
                        -right-24
                        w-48
                        h-48
                        rounded-full
                        bg-[#013f46]/40
                        blur-[70px]
                        pointer-events-none
                        transition-opacity
                        duration-300
                        group-hover:opacity-100
                        opacity-60
                    "
        />

        {/* Product image area */}
        <div
          className="
                        relative
                        aspect-[4/3]
                        bg-[#04161a]
                        border-b border-[#123a40]
                        overflow-hidden
                    "
        >
          {/* Technical grid */}
          <div
            className="
                            absolute
                            inset-0
                            opacity-60
                            pointer-events-none
                        "
            style={{
              backgroundImage: `
                                linear-gradient(
                                    rgba(168,196,200,.045) 1px,
                                    transparent 1px
                                ),
                                linear-gradient(
                                    90deg,
                                    rgba(168,196,200,.045) 1px,
                                    transparent 1px
                                )
                            `,
              backgroundSize: "32px 32px",
            }}
          />

          {/* Center glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 rounded-full bg-[#013f46]/30 blur-[65px]" />
          </div>

          {/* Product image */}
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <img
              src={drop.imageUrl}
              alt={drop.name}
              className="
                                relative
                                max-w-full
                                max-h-full
                                object-contain
                                drop-shadow-[0_20px_35px_rgba(0,0,0,.35)]
                                transition-transform
                                duration-500
                                group-hover:scale-[1.04]
                            "
            />
          </div>

          {/* Top status bar */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <div
              className="
                                inline-flex
                                items-center
                                gap-2
                                border border-[#17444a]
                                bg-[#061e22]/85
                                backdrop-blur-sm
                                rounded-full
                                px-3
                                py-1.5
                            "
            >
              <span
                className={`
                                    relative
                                    flex
                                    h-1.5
                                    w-1.5
                                    ${
                                      phase === "live"
                                        ? "bg-[#f9b223]"
                                        : phase === "upcoming"
                                          ? "bg-[#78999e]"
                                          : "bg-[#607f83]"
                                    }
                                    rounded-full
                                `}
              />

              <span className="font-mono text-[9px] tracking-[0.14em] text-[#a8c4c8]">
                {phase === "live"
                  ? "LIVE DROP"
                  : phase === "upcoming"
                    ? "UPCOMING"
                    : "ENDED"}
              </span>
            </div>

            {phase === "live" && (
              <div
                className="
                                    flex
                                    items-center
                                    gap-1.5
                                    bg-[#f9b223]
                                    text-[#013f46]
                                    rounded-full
                                    px-2.5
                                    py-1.5
                                    shadow-[0_0_20px_rgba(249,178,35,.15)]
                                "
              >
                <Zap size={11} />
                <span className="font-mono text-[9px] font-bold">LIVE</span>
              </div>
            )}

            {phase === "ended" && (
              <div
                className="
                                    flex
                                    items-center
                                    gap-1.5
                                    bg-[#26383b]
                                    text-[#8da5a8]
                                    rounded-full
                                    px-2.5
                                    py-1.5
                                "
              >
                <span className="font-mono text-[9px] font-semibold">
                  CLOSED
                </span>
              </div>
            )}
          </div>

          {/* Bottom technical label */}
          <div className="absolute bottom-3 left-4">
            <span className="font-mono text-[8px] tracking-[0.16em] text-[#52777c]">
              STOCKFLOW / DROP
            </span>
          </div>
        </div>

        {/* Card content */}
        <div className="relative p-5">
          {/* Product name + price */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-mono text-[8px] tracking-[0.16em] text-[#5f858a] mb-2">
                PRODUCT
              </p>

              <h3 className="text-base font-semibold text-[#e7f1f1] truncate">
                {drop.name}
              </h3>
            </div>

            <div className="shrink-0 text-right">
              <p className="font-mono text-[8px] tracking-[0.14em] text-[#5f858a] mb-2">
                PRICE
              </p>

              <p className="font-mono text-base font-semibold text-white">
                ₹{drop.unitPrice.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* Live / upcoming / ended information */}
          {phase === "live" && (
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Radio size={13} className="text-[#f9b223]" />

                  <span className="font-mono text-[9px] tracking-[0.13em] text-[#78999e]">
                    LIVE INVENTORY
                  </span>
                </div>

                <span
                  className={`
                                        font-mono text-xs font-semibold
                                        ${
                                          isLowStock
                                            ? "text-[#e08484]"
                                            : "text-[#f9b223]"
                                        }
                                    `}
                >
                  {liveStock === null
                    ? "CHECKING..."
                    : liveStock > 0
                      ? `IN STOCK`
                      : "OUT OF STOCK"}
                </span>
              </div>

              {/* Inventory bar */}
              <div className="h-1.5 bg-[#0d3035] rounded-full overflow-hidden">
                <div
                  className={`
                                        h-full
                                        rounded-full
                                        transition-all
                                        duration-700
                                        ${
                                          isLowStock
                                            ? "bg-[#e08484]"
                                            : "bg-[#f9b223]"
                                        }
                                    `}
                  style={{
                    width:
                      liveStock !== null
                        ? `${Math.min(
                            100,
                            Math.max(3, (liveStock / 100) * 100),
                          )}%`
                        : "100%",
                  }}
                />
              </div>

              <div className="flex items-center justify-between mt-2">
                <span className="font-mono text-[8px] text-[#4f7075]">
                  INVENTORY STATUS
                </span>

                <span className="font-mono text-[8px] text-[#4f7075]">
                  REAL-TIME
                </span>
              </div>
            </div>
          )}

          {phase === "upcoming" && (
            <div className="mt-5 border border-[#16424a] bg-[#061e22] rounded-xl p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Clock3 size={14} className="text-[#78999e]" />

                  <span className="font-mono text-[9px] tracking-[0.13em] text-[#668b90]">
                    STARTS IN
                  </span>
                </div>

                <Countdown targetTime={drop.flashSale.startTime} />
              </div>
            </div>
          )}

          {phase === "ended" && (
            <div className="mt-5 border border-[#263c40] bg-[#071a1e] rounded-xl p-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#607f83]" />

                <span className="font-mono text-[9px] tracking-[0.13em] text-[#668b90]">
                  THIS DROP HAS ENDED
                </span>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#123a40]">
            <div className="flex items-center gap-2">
              <ShoppingCart size={13} className="text-[#5d8085]" />

              <span className="font-mono text-[8px] tracking-[0.12em] text-[#52777c]">
                {phase === "live"
                  ? "READY TO BUY"
                  : phase === "upcoming"
                    ? "DROP SCHEDULED"
                    : "DROP CLOSED"}
              </span>
            </div>

            <span className="flex items-center gap-1.5 font-mono text-[9px] text-[#a8c4c8] group-hover:text-[#f9b223] transition-colors">
              VIEW DROP
              <ArrowRight
                size={12}
                className="group-hover:translate-x-1 transition-transform"
              />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

const ActiveDrops = () => {
  const [drops, setDrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getActiveDrops()
      .then(setDrops)
      .catch(() => setError("Failed to load drops. Is the backend running?"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#04161a] text-[#f4faf9] overflow-hidden relative">
      {/* ======================================================
                BACKGROUND
            ====================================================== */}

      <div
        className="
                    absolute
                    inset-0
                    pointer-events-none
                    opacity-70
                "
        style={{
          backgroundImage: `
                        linear-gradient(
                            rgba(168,196,200,.045) 1px,
                            transparent 1px
                        ),
                        linear-gradient(
                            90deg,
                            rgba(168,196,200,.045) 1px,
                            transparent 1px
                        )
                    `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-[5%] top-[10%] w-80 h-80 rounded-full bg-[#013f46]/35 blur-[130px]" />

        <div className="absolute right-[5%] top-[30%] w-96 h-96 rounded-full bg-[#f9b223]/[0.035] blur-[140px]" />

        <div className="absolute left-[40%] bottom-[5%] w-96 h-96 rounded-full bg-[#013f46]/20 blur-[140px]" />
      </div>

      {/* ======================================================
                CONTENT
            ====================================================== */}

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-10 lg:py-14">
        {/* Back to home */}
        <Link
          to="/"
          className="
                        inline-flex
                        items-center
                        gap-2
                        border border-[#17444a]
                        bg-[#061e22]/70
                        backdrop-blur-sm
                        rounded-full
                        px-3
                        py-1.5
                        mb-6
                        font-mono
                        text-[9px]
                        tracking-[0.14em]
                        text-[#a8c4c8]
                        hover:text-[#f9b223]
                        hover:border-[#28616a]
                        transition-colors
                    "
        >
          <ArrowLeft size={12} />
          BACK TO HOME
        </Link>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div>
            {/* System status */}
            <div
              className="
                                inline-flex
                                items-center
                                gap-2
                                border border-[#17444a]
                                bg-[#061e22]/70
                                backdrop-blur-sm
                                rounded-full
                                px-3
                                py-1.5
                                mb-6
                            "
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#f9b223] opacity-70 animate-ping" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#f9b223]" />
              </span>

              <span className="font-mono text-[9px] tracking-[0.16em] text-[#a8c4c8]">
                LIVE COMMERCE SYSTEM
              </span>
            </div>

            <p className="font-mono text-[10px] tracking-[0.22em] text-[#f9b223] mb-4">
              STOCKFLOW / DROPS
            </p>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.045em] leading-[0.98]">
              Active drops.
              <br />
              <span className="text-[#78999e]">Real inventory.</span>
            </h1>

            <p className="text-[#7f9fa4] text-sm lg:text-base max-w-2xl mt-5 leading-relaxed">
              Limited inventory, live stock updates, and concurrency-safe
              purchasing. Every number you see is tied to the live drop system.
            </p>
          </div>

          {/* System status panel */}
          <div
            className="
                            shrink-0
                            border border-[#15434a]
                            bg-[#061d21]/90
                            backdrop-blur-xl
                            rounded-xl
                            px-5
                            py-4
                            min-w-[230px]
                        "
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[8px] tracking-[0.16em] text-[#5d8085]">
                DROP SYSTEM
              </span>

              <span className="flex items-center gap-1.5 font-mono text-[8px] text-[#67c987]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#67c987]" />
                ONLINE
              </span>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <p className="font-mono text-2xl font-semibold text-[#e7f1f1]">
                  {drops.length}
                </p>

                <p className="font-mono text-[8px] text-[#52777c] mt-1">
                  AVAILABLE DROPS
                </p>
              </div>

              <Zap size={20} className="text-[#f9b223]" />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px flex-1 bg-gradient-to-r from-[#19434a] to-transparent" />

          <span className="font-mono text-[8px] tracking-[0.18em] text-[#52777c]">
            LIVE INVENTORY FEED
          </span>

          <div className="h-px flex-1 bg-gradient-to-l from-[#19434a] to-transparent" />
        </div>

        {/* Loading */}
        {loading && (
          <div className="border border-[#15434a] bg-[#061d21]/90 rounded-2xl min-h-[320px] flex flex-col items-center justify-center">
            <div className="relative mb-5">
              <div className="w-10 h-10 rounded-full border border-[#17444a]" />

              <div className="absolute inset-0 w-10 h-10 rounded-full border-t border-[#f9b223] animate-spin" />
            </div>

            <p className="font-mono text-[10px] tracking-[0.16em] text-[#78999e]">
              CONNECTING TO DROP SYSTEM
            </p>

            <p className="font-mono text-[8px] text-[#4f7075] mt-2">
              FETCHING ACTIVE INVENTORY...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="border border-[#5b3035] bg-[#24171a]/90 rounded-2xl p-12 text-center">
            <div className="w-10 h-10 rounded-xl bg-[#e08484]/10 flex items-center justify-center mx-auto mb-4">
              <Radio size={18} className="text-[#e08484]" />
            </div>

            <p className="font-mono text-[10px] tracking-[0.15em] text-[#e08484]">
              SYSTEM CONNECTION FAILED
            </p>

            <p className="text-sm text-[#9b777b] mt-3">{error}</p>
          </div>
        )}

        {/* Drops */}
        {!loading && !error && drops.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {drops.map((drop) => (
                <DropCard key={drop._id} drop={drop} />
              ))}
            </div>

            {/* Bottom status */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#123a40] pt-5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#67c987] opacity-60 animate-ping" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#67c987]" />
                </span>

                <span className="font-mono text-[8px] tracking-[0.13em] text-[#52777c]">
                  SOCKET.IO / INVENTORY STREAM ACTIVE
                </span>
              </div>

              <span className="font-mono text-[8px] tracking-[0.13em] text-[#405f64]">
                STOCKFLOW CONCURRENCY INFRASTRUCTURE
              </span>
            </div>
          </>
        )}

        {/* Empty */}
        {!loading && !error && drops.length === 0 && (
          <div className="border border-[#15434a] bg-[#061d21]/90 rounded-2xl p-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#013f46]/40 flex items-center justify-center mx-auto mb-5">
              <Zap size={20} className="text-[#78999e]" />
            </div>

            <p className="font-mono text-[10px] tracking-[0.16em] text-[#78999e]">
              NO ACTIVE DROPS
            </p>

            <p className="text-sm text-[#5d8085] mt-3">
              The system is operational. Check back when the next drop goes
              live.
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <span className="font-mono text-[8px] text-[#405f64]">
                SYSTEM STATUS
              </span>

              <span className="flex items-center gap-1.5 font-mono text-[8px] text-[#67c987]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#67c987]" />
                OPERATIONAL
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveDrops;
