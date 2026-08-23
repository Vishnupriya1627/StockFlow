import React, { useEffect, useState } from "react";
import {
  Zap,
  Play,
  ShieldCheck,
  Activity,
  Database,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Users,
  ArrowRight,
  ChevronDown,
} from "lucide-react";

import { getActiveDrops } from "../../api/flashSaleApi";
import { getDropStats, simulateLoad } from "../../api/opsApi";
import socket from "../../socket";

import stockFlowLogo from "../../assets/stockflow_logo.png";

const OpsDashboard = () => {
  const [drops, setDrops] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [stats, setStats] = useState(null);
  const [count, setCount] = useState(300);
  const [simulating, setSimulating] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [error, setError] = useState(null);

  // Load the list of live drops to pick from
  useEffect(() => {
    getActiveDrops().then((allDrops) => {
      const liveOnly = allDrops.filter(
        (d) => d.flashSale.status === "live"
      );

      setDrops(liveOnly);

      if (liveOnly.length > 0) {
        setSelectedId(liveOnly[0]._id);
      }
    });
  }, []);

  // Poll stats + watch live socket updates for the selected product
  useEffect(() => {
    if (!selectedId) return;

    let cancelled = false;

    const fetchStats = () => {
      getDropStats(selectedId)
        .then((data) => {
          if (!cancelled) setStats(data);
        })
        .catch(() => {});
    };

    fetchStats();

    const interval = setInterval(fetchStats, 3000);

    socket.emit("watchProduct", selectedId);

    const handler = (data) => {
      if (data.productId === selectedId) {
        setStats((prev) =>
          prev
            ? {
                ...prev,
                remainingStock: data.remainingStock,
              }
            : prev
        );
      }
    };

    socket.on("stockUpdate", handler);

    return () => {
      cancelled = true;
      clearInterval(interval);
      socket.emit("unwatchProduct", selectedId);
      socket.off("stockUpdate", handler);
    };
  }, [selectedId]);

  async function handleSimulate() {
    setSimulating(true);
    setError(null);
    setLastResult(null);

    try {
      const result = await simulateLoad(selectedId, count);
      setLastResult(result);
    } catch (err) {
      setError(
        err.response?.data?.message || "Simulation failed."
      );
    } finally {
      setSimulating(false);
    }
  }

  const remainingStock = stats?.remainingStock ?? null;
  const requests = stats?.requests ?? null;
  const oversellBlocked = stats?.oversellBlocked ?? null;

  return (
    <div className="relative min-h-screen bg-[#04161a] text-[#f4faf9] overflow-hidden">

      {/* ============================================================
          ANIMATIONS
      ============================================================ */}

      <style>{`
        @keyframes pulseSoft {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1);
          }

          50% {
            opacity: 1;
            transform: scale(1.08);
          }
        }

        @keyframes gridMove {
          from {
            background-position: 0 0;
          }

          to {
            background-position: 0 40px;
          }
        }

        @keyframes scan {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }

          15% {
            opacity: 0.35;
          }

          85% {
            opacity: 0.35;
          }

          100% {
            transform: translateY(1000%);
            opacity: 0;
          }
        }

        @keyframes flowRight {
          0% {
            transform: translateX(-10px);
            opacity: 0;
          }

          30% {
            opacity: 1;
          }

          100% {
            transform: translateX(35px);
            opacity: 0;
          }
        }

        @keyframes revealUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes numberFlash {
          from {
            opacity: 0.3;
            transform: translateY(3px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .stockflow-grid {
          background-image:
            linear-gradient(
              rgba(168, 196, 200, 0.045) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(168, 196, 200, 0.045) 1px,
              transparent 1px
            );

          background-size: 40px 40px;
          animation: gridMove 20s linear infinite;
        }

        .stockflow-pulse {
          animation: pulseSoft 1.8s ease-in-out infinite;
        }

        .stockflow-scan {
          animation: scan 8s linear infinite;
        }

        .stockflow-reveal {
          animation: revealUp 0.7s ease-out both;
        }

        .stockflow-reveal-2 {
          animation: revealUp 0.7s 0.12s ease-out both;
        }

        .stockflow-reveal-3 {
          animation: revealUp 0.7s 0.24s ease-out both;
        }

        .stockflow-number {
          animation: numberFlash 0.35s ease-out;
        }
      `}</style>

      {/* ============================================================
          BACKGROUND
      ============================================================ */}

      <div className="absolute inset-0 stockflow-grid pointer-events-none" />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">

        <div className="absolute left-[5%] top-[12%] w-96 h-96 rounded-full bg-[#013f46]/40 blur-[130px]" />

        <div className="absolute right-[3%] top-[20%] w-[28rem] h-[28rem] rounded-full bg-[#f9b223]/[0.035] blur-[140px]" />

        <div className="absolute left-[45%] bottom-[10%] w-80 h-80 rounded-full bg-[#013f46]/30 blur-[130px]" />

      </div>

      {/* Scanning line */}
      <div className="absolute left-0 right-0 h-px bg-[#f9b223]/20 stockflow-scan pointer-events-none" />

      {/* ============================================================
          TOP NAV / BRAND
      ============================================================ */}

      <nav className="relative z-20 border-b border-[#12373d]/80 bg-[#04161a]/70 backdrop-blur-xl">

        {/* <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="relative">

              <div className="absolute inset-0 bg-[#f9b223]/10 blur-lg rounded-full" />

              <img
                src={stockFlowLogo}
                alt="StockFlow"
                className="relative w-9 h-9 object-contain"
              />

            </div>

            <div>

              <span className="text-lg font-semibold tracking-tight">
                StockFlow
              </span>

              <span className="hidden sm:block text-[9px] font-mono text-[#6e9398] tracking-[0.18em] mt-0.5">
                CONCURRENCY INFRASTRUCTURE
              </span>

            </div>

          </div>

          <div className="flex items-center gap-3">

            <div className="hidden sm:flex items-center gap-2 text-[9px] font-mono text-[#6e9398]">

              <span className="relative flex h-1.5 w-1.5">

                <span className="absolute inline-flex h-full w-full rounded-full bg-[#66d68b] stockflow-pulse" />

                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#66d68b]" />

              </span>

              SYSTEM ONLINE

            </div>

            <div className="hidden sm:block h-4 w-px bg-[#1a4147]" />

            <span className="font-mono text-[9px] tracking-[0.12em] text-[#54777c]">
              OPS / LIVE
            </span>

          </div>

        </div> */}

      </nav>

      {/* ============================================================
          MAIN CONTENT
      ============================================================ */}

      <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-10 lg:py-14">

        {/* ========================================================
            HEADER
        ======================================================== */}

        <div className="stockflow-reveal flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12">

          <div>

            <div className="inline-flex items-center gap-2 border border-[#17444a] bg-[#061e22]/75 backdrop-blur-sm rounded-full px-3 py-1.5 mb-6">

              <span className="relative flex h-1.5 w-1.5">

                <span className="absolute inline-flex h-full w-full rounded-full bg-[#f9b223] stockflow-pulse" />

                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#f9b223]" />

              </span>

              <span className="font-mono text-[9px] tracking-[0.16em] text-[#a8c4c8]">
                OPERATIONS CONSOLE
              </span>

            </div>

            <p className="font-mono text-[10px] tracking-[0.22em] text-[#f9b223] mb-4">
              CONCURRENCY INFRASTRUCTURE
            </p>

            <h1 className="text-5xl lg:text-[64px] font-semibold leading-[0.98] tracking-[-0.045em]">

              Live Ops

              <br />

              <span className="text-[#78999e]">
                Dashboard.
              </span>

            </h1>

            <p className="text-[#8eafb3] text-sm lg:text-base mt-6 max-w-2xl leading-relaxed">
              Real-time concurrency proof for the currently selected
              drop. Watch inventory, simulate traffic, and verify that
              StockFlow never oversells.
            </p>

          </div>

          <div className="flex items-center gap-3">

            <div className="flex items-center gap-2 border border-[#17444a] bg-[#061e22]/80 rounded-lg px-3 py-2.5">

              <span className="relative flex h-1.5 w-1.5">

                <span className="absolute inline-flex h-full w-full rounded-full bg-[#66d68b] stockflow-pulse" />

                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#66d68b]" />

              </span>

              <span className="font-mono text-[9px] tracking-[0.12em] text-[#83a5aa]">
                SYSTEM OPERATIONAL
              </span>

            </div>

          </div>

        </div>

        {/* ========================================================
            NO LIVE DROPS
        ======================================================== */}

        {drops.length === 0 ? (

          <div className="stockflow-reveal relative border border-[#15434a] bg-[#061d21]/90 rounded-2xl overflow-hidden shadow-2xl">

            <div className="h-px bg-gradient-to-r from-transparent via-[#f9b223]/50 to-transparent" />

            <div className="py-24 px-6 text-center">

              <div className="w-14 h-14 rounded-2xl bg-[#f9b223]/[0.07] border border-[#f9b223]/10 flex items-center justify-center mx-auto mb-6">

                <Zap
                  size={24}
                  className="text-[#f9b223]"
                />

              </div>

              <p className="font-mono text-[9px] tracking-[0.18em] text-[#668b90] mb-3">
                DROP STATUS
              </p>

              <p className="text-base font-semibold text-[#dcebea]">
                No drops are live right now.
              </p>

              <p className="text-xs text-[#6e9095] mt-2 max-w-md mx-auto leading-relaxed">
                The operations console will become available when a
                flash sale is live.
              </p>

            </div>

          </div>

        ) : (

          <>

            {/* ======================================================
                CONTROL PANEL
            ====================================================== */}

            <section className="stockflow-reveal-2 relative border border-[#15434a] bg-[#061d21]/95 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl">

              <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-[#013f46]/10 via-transparent to-[#f9b223]/[0.015]" />

              <div className="relative px-6 lg:px-7 py-4 border-b border-[#123a40] flex items-center justify-between">

                <div className="flex items-center gap-2">

                  <Activity
                    size={14}
                    className="text-[#f9b223]"
                  />

                  <span className="font-mono text-[9px] tracking-[0.16em] text-[#a8c4c8]">
                    LOAD TEST CONTROLS
                  </span>

                </div>

                <span className="font-mono text-[8px] text-[#587b80]">
                  LIVE DROP
                </span>

              </div>

              <div className="relative p-6 lg:p-7">

                <div className="grid lg:grid-cols-[1fr_auto_auto] gap-5 items-end">

                  {/* Drop selector */}

                  <div>

                    <label className="font-mono text-[9px] tracking-[0.14em] text-[#668b90] block mb-2">
                      SELECT LIVE DROP
                    </label>

                    <div className="relative">

                      <select
                        value={selectedId}
                        onChange={(e) =>
                          setSelectedId(e.target.value)
                        }
                        className="w-full appearance-none text-sm border border-[#17444a] rounded-xl px-4 py-3 outline-none bg-[#04181c] text-[#d8e8e9] focus:border-[#f9b223]/60 transition-colors"
                      >

                        {drops.map((d) => (

                          <option
                            key={d._id}
                            value={d._id}
                            className="bg-[#061d21] text-white"
                          >
                            {d.name}
                          </option>

                        ))}

                      </select>

                      <ChevronDown
                        size={15}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#6e9095]"
                      />

                    </div>

                  </div>

                  {/* Buyer count */}

                  <div>

                    <label className="font-mono text-[9px] tracking-[0.14em] text-[#668b90] block mb-2">
                      SIMULATED BUYERS
                    </label>

                    <input
                      type="number"
                      min="1"
                      max="2000"
                      value={count}
                      onChange={(e) =>
                        setCount(e.target.value)
                      }
                      className="w-full lg:w-36 text-sm border border-[#17444a] rounded-xl px-4 py-3 outline-none bg-[#04181c] text-[#d8e8e9] focus:border-[#f9b223]/60 transition-colors"
                    />

                  </div>

                  {/* Simulate */}

                  <button
                    onClick={handleSimulate}
                    disabled={simulating || !selectedId}
                    className="group flex items-center justify-center gap-2 bg-[#f9b223] text-[#013f46] text-sm font-semibold px-6 py-3 rounded-xl hover:bg-[#ffc44e] transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >

                    <Play
                      size={14}
                      className={
                        simulating
                          ? "animate-pulse"
                          : "group-hover:translate-x-0.5 transition-transform"
                      }
                    />

                    {simulating
                      ? "Firing requests..."
                      : "Simulate Load Test"}

                    {!simulating && (
                      <ArrowRight
                        size={14}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    )}

                  </button>

                </div>

              </div>

            </section>

            {/* ======================================================
                ERROR
            ====================================================== */}

            {error && (

              <div className="mt-5 flex items-start gap-3 border border-[#653c3c] bg-[#241719]/80 rounded-xl px-4 py-3">

                <AlertTriangle
                  size={16}
                  className="text-[#e08484] mt-0.5 shrink-0"
                />

                <div>

                  <p className="font-mono text-[9px] tracking-[0.12em] text-[#e08484]">
                    SIMULATION ERROR
                  </p>

                  <p className="text-sm text-[#b78b8b] mt-1">
                    {error}
                  </p>

                </div>

              </div>

            )}

            {/* ======================================================
                LIVE TELEMETRY HEADER
            ====================================================== */}

            <div className="mt-12 flex items-center gap-4">

              <span className="font-mono text-[9px] tracking-[0.18em] text-[#668b90]">
                LIVE TELEMETRY
              </span>

              <div className="h-px flex-1 bg-gradient-to-r from-[#19434a] to-transparent" />

              <span className="flex items-center gap-1.5 font-mono text-[8px] text-[#66b47e]">

                <span className="relative flex h-1.5 w-1.5">

                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#66d68b] stockflow-pulse" />

                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#66d68b]" />

                </span>

                SOCKET.IO

              </span>

            </div>

            {/* ======================================================
                METRICS
            ====================================================== */}

            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-5">

              <OpsMetric
                icon={Database}
                eyebrow="REMAINING STOCK"
                value={
                  remainingStock !== null
                    ? remainingStock
                    : "—"
                }
                description="Inventory currently available."
                accent
              />

              <OpsMetric
                icon={Radio}
                eyebrow="TOTAL REQUESTS"
                value={
                  requests !== null ? requests : "—"
                }
                description="Requests processed by the system."
              />

              <OpsMetric
                icon={ShieldCheck}
                eyebrow="OVERSELL BLOCKED"
                value={
                  oversellBlocked !== null
                    ? oversellBlocked
                    : "—"
                }
                description="Unsafe inventory operations prevented."
                success
              />

              <OpsMetric
                icon={Users}
                eyebrow="LAST SIMULATION"
                value={
                  lastResult
                    ? `${lastResult.successCount}`
                    : "—"
                }
                suffix={
                  lastResult
                    ? ` sold / ${lastResult.soldOutCount} rejected`
                    : ""
                }
                description="Result from the latest load test."
              />

            </div>

            {/* ======================================================
                CONCURRENCY PROOF
            ====================================================== */}

            <div className="mt-5 grid lg:grid-cols-[1.35fr_.65fr] gap-5">

              {/* Explanation */}

              <div className="relative border border-[#15434a] bg-[#061d21]/95 rounded-2xl overflow-hidden shadow-xl">

                <div className="px-6 py-4 border-b border-[#123a40] flex items-center justify-between">

                  <div className="flex items-center gap-2">

                    <ShieldCheck
                      size={14}
                      className="text-[#f9b223]"
                    />

                    <span className="font-mono text-[9px] tracking-[0.16em] text-[#a8c4c8]">
                      CONCURRENCY PROOF
                    </span>

                  </div>

                  <span className="font-mono text-[8px] text-[#66d68b]">
                    ATOMIC
                  </span>

                </div>

                <div className="p-6">

                  <h3 className="text-lg font-semibold text-[#e7f1f1]">
                    What this proves
                  </h3>

                  <p className="text-sm text-[#7f9fa4] leading-relaxed mt-3">
                    Every simulated buyer goes through the exact same
                    atomic Redis Lua script as a real buyer — nothing
                    about the concurrency safety is faked.
                  </p>

                  <p className="text-sm text-[#7f9fa4] leading-relaxed mt-3">

                    The{" "}

                    <span className="font-medium text-[#cfe0e1]">
                      Oversell Attempts Blocked
                    </span>{" "}

                    counter is the proof. It rises every time a
                    simulated request would have oversold the product.

                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">

                    <ProofTag text="REDIS" />
                    <ProofTag text="LUA" />
                    <ProofTag text="ATOMIC CHECK" />
                    <ProofTag text="NO OVERSELL" />

                  </div>

                </div>

              </div>

              {/* Result panel */}

              <div className="relative bg-[#013f46] border border-[#18505a] rounded-2xl overflow-hidden shadow-xl">

                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/[0.02] via-transparent to-[#f9b223]/[0.025]" />

                <div className="relative px-6 py-4 border-b border-[#18505a] flex items-center justify-between">

                  <div className="flex items-center gap-2">

                    <Activity
                      size={14}
                      className="text-[#f9b223]"
                    />

                    <span className="font-mono text-[9px] tracking-[0.16em] text-[#b2c9cb]">
                      SIMULATION RESULT
                    </span>

                  </div>

                  <span className="font-mono text-[8px] text-[#668b90]">
                    LAST RUN
                  </span>

                </div>

                <div className="relative p-6">

                  {lastResult ? (

                    <>

                      <div className="flex items-end gap-2">

                        <span
                          key={lastResult.successCount}
                          className="stockflow-number font-mono text-4xl font-semibold text-[#f9b223]"
                        >
                          {lastResult.successCount}
                        </span>

                        <span className="font-mono text-[9px] text-[#77999e] mb-1">
                          SUCCESSFUL
                        </span>

                      </div>

                      <div className="mt-6 space-y-3">

                        <ResultRow
                          label="SOLD"
                          value={lastResult.successCount}
                          positive
                        />

                        <ResultRow
                          label="REJECTED"
                          value={lastResult.soldOutCount}
                        />

                      </div>

                    </>

                  ) : (

                    <div className="py-6">

                      <div className="w-11 h-11 rounded-xl bg-white/[0.05] border border-white/[0.06] flex items-center justify-center mb-5">

                        <Play
                          size={17}
                          className="text-[#77999e]"
                        />

                      </div>

                      <p className="text-sm font-medium text-[#d5e5e6]">
                        No simulation yet
                      </p>

                      <p className="text-xs text-[#668b90] mt-2 leading-relaxed">
                        Fire a load test to see the concurrency
                        protection in action.
                      </p>

                    </div>

                  )}

                </div>

              </div>

            </div>

            {/* ======================================================
                GUARANTEE
            ====================================================== */}

            <div className="mt-5 border border-[#286247] bg-[#66d68b]/[0.035] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">

              <div className="w-10 h-10 rounded-xl bg-[#66d68b]/10 flex items-center justify-center shrink-0">

                <CheckCircle2
                  size={18}
                  className="text-[#66d68b]"
                />

              </div>

              <div className="flex-1">

                <p className="font-mono text-[9px] tracking-[0.15em] text-[#66d68b]">
                  INVENTORY GUARANTEE
                </p>

                <p className="text-sm text-[#87aaa0] mt-1 leading-relaxed">
                  Final remaining stock can never become negative.
                  Check + decrement happen as one indivisible
                  operation.
                </p>

              </div>

              <div className="font-mono text-[10px] text-[#66d68b] whitespace-nowrap">
                ✓ ONE SOURCE OF TRUTH
              </div>

            </div>

          </>

        )}

        {/* ============================================================
            FOOTER LABEL
        ============================================================ */}

        <div className="mt-12 flex items-center gap-4">

          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#19434a] to-transparent" />

          <span className="font-mono text-[8px] tracking-[0.16em] text-[#50757a]">
            STOCKFLOW / OPERATIONS / LIVE
          </span>

          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#19434a] to-transparent" />

        </div>

      </main>

    </div>
  );
};

/* ============================================================
   OPS METRIC
============================================================ */

const OpsMetric = ({
  icon: Icon,
  eyebrow,
  value,
  suffix = "",
  description,
  accent = false,
  success = false,
}) => {
  let iconClasses =
    "bg-[#0c3035] text-[#89a9ad]";

  let valueClasses = "text-[#e7f1f1]";

  if (accent) {
    iconClasses =
      "bg-[#f9b223]/10 text-[#f9b223]";

    valueClasses = "text-[#f9b223]";
  }

  if (success) {
    iconClasses =
      "bg-[#66d68b]/10 text-[#66d68b]";

    valueClasses = "text-[#66d68b]";
  }

  return (
    <div className="group relative border border-[#15434a] bg-[#061d21]/95 rounded-2xl p-6 hover:border-[#245961] hover:-translate-y-0.5 hover:shadow-[0_15px_45px_rgba(1,63,70,.25)] transition-all duration-300 overflow-hidden">

      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/[0.012] to-transparent" />

      <div className="relative flex items-center justify-between">

        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconClasses}`}
        >
          <Icon size={18} />
        </div>

        <span className="flex items-center gap-1.5 font-mono text-[8px] text-[#66b47e]">

          <span className="relative flex h-1.5 w-1.5">

            <span className="absolute inline-flex h-full w-full rounded-full bg-[#66d68b] stockflow-pulse" />

            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#66d68b]" />

          </span>

          LIVE

        </span>

      </div>

      <p className="relative font-mono text-[9px] tracking-[0.16em] text-[#668b90] mt-7">
        {eyebrow}
      </p>

      <div className="relative flex items-baseline gap-2 mt-2">

        <span
          key={String(value)}
          className={`stockflow-number font-mono text-3xl font-semibold ${valueClasses}`}
        >
          {value}
        </span>

        {suffix && (
          <span className="font-mono text-[9px] text-[#6f9196]">
            {suffix}
          </span>
        )}

      </div>

      <p className="relative text-xs text-[#718f94] leading-relaxed mt-3">
        {description}
      </p>

    </div>
  );
};

/* ============================================================
   PROOF TAG
============================================================ */

const ProofTag = ({ text }) => {
  return (
    <span className="font-mono text-[8px] tracking-[0.08em] text-[#83a5aa] border border-[#17444a] bg-[#04181c] rounded-md px-2.5 py-1.5">
      {text}
    </span>
  );
};

/* ============================================================
   RESULT ROW
============================================================ */

const ResultRow = ({
  label,
  value,
  positive = false,
}) => {
  return (
    <div className="flex items-center justify-between border-b border-[#18505a] pb-2.5">

      <span className="font-mono text-[9px] tracking-[0.12em] text-[#77999e]">
        {label}
      </span>

      <span
        className={`font-mono text-sm font-semibold ${
          positive
            ? "text-[#66d68b]"
            : "text-[#d5e5e6]"
        }`}
      >
        {value}
      </span>

    </div>
  );
};

export default OpsDashboard;