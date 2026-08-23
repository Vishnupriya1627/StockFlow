import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  Check,
  ChevronRight,
  Clock3,
  Database,
  Gauge,
  LockKeyhole,
  Radio,
  Server,
  ShieldCheck,
  ShoppingCart,
  Timer,
  Users,
  Zap,
} from "lucide-react";

import stockFlowLogo from "../../assets/stockflow_logo.png";

/* ============================================================
   DATA
============================================================ */

const stack = [
  "Redis",
  "Lua",
  "Socket.IO",
  "MongoDB",
  "Node / Express",
  "BullMQ",
];

const bugFixes = [
  {
    number: "01",
    label: "RATE LIMIT",
    bug: '"A little too much love — please try again."',
    fix: "Waiting Room Queue",
    detail:
      "Concurrent traffic gets a fair position in line instead of a blunt rejection.",
    metric: "1,284",
    metricLabel: "requests/sec handled",
    icon: Gauge,
  },
  {
    number: "02",
    label: "RACE CONDITION",
    bug: '"Added to cart" → "out of stock" at checkout.',
    fix: "Atomic Redis Lua Script",
    detail:
      "Stock is checked and decremented as one indivisible operation. No race condition. No false success.",
    metric: "0",
    metricLabel: "oversold units",
    icon: ShieldCheck,
  },
  {
    number: "03",
    label: "CHECKOUT HANG",
    bug: "Checkout hung and never resolved.",
    fix: "TTL-backed Reservations",
    detail:
      "A five-minute hold with an explicit expiry. A reservation either exists or it doesn't.",
    metric: "05:00",
    metricLabel: "reservation window",
    icon: Timer,
  },
];

const buyerNames = [
  "buyer_84f2",
  "buyer_a19c",
  "buyer_73bd",
  "buyer_c21a",
  "buyer_9e10",
  "buyer_42dd",
  "buyer_f881",
  "buyer_17ac",
];

const eventTypes = [
  {
    text: "Buyer entered waiting room",
    color: "amber",
  },
  {
    text: "Stock reservation created",
    color: "green",
  },
  {
    text: "Atomic stock check passed",
    color: "green",
  },
  {
    text: "Reservation expired",
    color: "gray",
  },
];

const initialTraffic = [
  20, 27, 23, 32, 29, 42, 36, 49, 45, 58, 53, 65, 61, 72, 68, 81, 76, 89,
  84, 96, 91, 105, 99, 114, 108, 123, 118, 131, 127, 140, 135, 149, 144,
  157, 152, 165, 160, 173, 168, 181, 176, 190, 184, 197, 192, 205, 200, 214,
];

/* ============================================================
   MAIN COMPONENT
============================================================ */

const LandingPage = () => {
  const navigate = useNavigate();

  const [requests, setRequests] = useState(1284);
  const [stock, setStock] = useState(147);
  const [reserved, setReserved] = useState(31);
  const [buyers, setBuyers] = useState(327);

  const [events, setEvents] = useState([
    {
      id: 1,
      buyer: "buyer_84f2",
      text: "Atomic stock check passed",
      color: "green",
    },
    {
      id: 2,
      buyer: "buyer_a19c",
      text: "Buyer entered waiting room",
      color: "amber",
    },
    {
      id: 3,
      buyer: "buyer_73bd",
      text: "Stock reservation created",
      color: "green",
    },
    {
      id: 4,
      buyer: "buyer_c21a",
      text: "Reservation expired",
      color: "gray",
    },
  ]);

  const [traffic, setTraffic] = useState(initialTraffic);

  const totalStock = 200;

  /* ------------------------------------------------------------
     Simulated live telemetry
  ------------------------------------------------------------ */

  useEffect(() => {
    const interval = setInterval(() => {
      setRequests((previous) => {
        const change = Math.floor(Math.random() * 180) - 70;

        return Math.max(
          850,
          Math.min(1900, previous + change)
        );
      });

      setBuyers((previous) => {
        const change = Math.floor(Math.random() * 15) - 5;

        return Math.max(
          280,
          Math.min(480, previous + change)
        );
      });

      setStock((previous) => {
        const decrease = Math.random() > 0.45;

        if (decrease && previous > 82) {
          return previous - 1;
        }

        if (!decrease && previous < 155) {
          return previous + 1;
        }

        return previous;
      });

      setReserved((previous) => {
        const change = Math.floor(Math.random() * 5) - 2;

        return Math.max(
          18,
          Math.min(48, previous + change)
        );
      });

      setTraffic((previous) => {
        const last = previous[previous.length - 1];

        const nextValue = Math.max(
          30,
          Math.min(
            220,
            last + Math.floor(Math.random() * 35) - 10
          )
        );

        return [...previous.slice(1), nextValue];
      });

      const randomBuyer =
        buyerNames[Math.floor(Math.random() * buyerNames.length)];

      const randomEvent =
        eventTypes[Math.floor(Math.random() * eventTypes.length)];

      const newEvent = {
        id: Date.now(),
        buyer: randomBuyer,
        text: randomEvent.text,
        color: randomEvent.color,
      };

      setEvents((previous) => [
        newEvent,
        ...previous,
      ].slice(0, 5));
    }, 1800);

    return () => {
      clearInterval(interval);
    };
  }, []);

  /* ------------------------------------------------------------
     Traffic graph
  ------------------------------------------------------------ */

  const graphPoints = useMemo(() => {
    const maximum = Math.max(...traffic);
    const minimum = Math.min(...traffic);

    return traffic
      .map((value, index) => {
        const x =
          (index / (traffic.length - 1)) * 100;

        const y =
          88 -
          ((value - minimum) /
            Math.max(1, maximum - minimum)) *
            68;

        return `${x},${y}`;
      })
      .join(" ");
  }, [traffic]);

  const stockPercentage =
    Math.round((stock / totalStock) * 100);

  /* ------------------------------------------------------------
     Render
  ------------------------------------------------------------ */

  return (
    <div className="min-h-screen bg-[#04161a] text-[#f4faf9] overflow-hidden">

      {/* ========================================================
         ANIMATIONS
      ======================================================== */}

      <style>{`
        @keyframes pulseSoft {
          0%, 100% {
            opacity: 0.45;
            transform: scale(1);
          }

          50% {
            opacity: 1;
            transform: scale(1.08);
          }
        }

        @keyframes floatSlow {
          0%, 100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-8px);
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
            opacity: 0.4;
          }

          85% {
            opacity: 0.4;
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
            transform: translateX(30px);
            opacity: 0;
          }
        }

        @keyframes flowDown {
          0% {
            transform: translateY(-8px);
            opacity: 0;
          }

          30% {
            opacity: 1;
          }

          100% {
            transform: translateY(30px);
            opacity: 0;
          }
        }

        @keyframes revealUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes numberFlash {
          from {
            opacity: 0.35;
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

        .stockflow-float {
          animation: floatSlow 5s ease-in-out infinite;
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

        .stockflow-reveal-4 {
          animation: revealUp 0.7s 0.36s ease-out both;
        }

        .stockflow-number {
          animation: numberFlash 0.35s ease-out;
        }
      `}</style>

      {/* ========================================================
         HERO
      ======================================================== */}

      <section className="relative min-h-screen">

        {/* Background grid */}
        <div className="absolute inset-0 stockflow-grid pointer-events-none" />

        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute left-[8%] top-[20%] w-72 h-72 rounded-full bg-[#013f46]/40 blur-[120px]" />

          <div className="absolute right-[5%] top-[35%] w-96 h-96 rounded-full bg-[#f9b223]/[0.04] blur-[130px]" />
        </div>

        {/* Scanning line */}
        <div className="absolute left-0 right-0 h-px bg-[#f9b223]/20 stockflow-scan pointer-events-none" />

        {/* ======================================================
           NAVBAR
        ====================================================== */}

        <nav className="relative z-20 max-w-7xl mx-auto px-6 lg:px-8 py-6 flex items-center justify-between">

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

            <div className="hidden md:flex items-center gap-2 mr-3 text-[10px] font-mono text-[#7da0a5]">

              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#f9b223] stockflow-pulse" />

                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f9b223]" />
              </span>

              SYSTEM ONLINE

            </div>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-sm font-medium text-[#c8dde0] hover:text-white px-4 py-2 transition-colors"
            >
              Admin login
            </button>

            <button
              type="button"
              onClick={() => navigate("/drops")}
              className="group flex items-center gap-2 bg-[#f9b223] text-[#013f46] text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#ffc44e] transition-all"
            >
              Enter the drop

              <ArrowRight
                size={15}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>

          </div>
        </nav>

        {/* ======================================================
           HERO CONTENT
        ====================================================== */}

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-6 pt-4 lg:pt-4 pb-20 -translate-y-6">

          <div className="grid lg:grid-cols-[1.05fr_.95fr] gap-16 items-center">

            {/* LEFT */}
            <div>

              <div className="stockflow-reveal inline-flex items-center gap-2 border border-[#17444a] bg-[#061e22]/70 backdrop-blur-sm rounded-full px-3 py-1.5 mb-7">

                <span className="relative flex h-1.5 w-1.5">

                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#f9b223] stockflow-pulse" />

                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#f9b223]" />

                </span>

                <span className="font-mono text-[10px] tracking-[0.16em] text-[#b5cdd0]">
                  LIVE FLASH SALE INFRASTRUCTURE
                </span>

              </div>

              <p className="stockflow-reveal font-mono text-xs tracking-[0.22em] text-[#f9b223] mb-5">
                BUILT TO SURVIVE THE CLICK
              </p>

              <h1 className="stockflow-reveal-2 text-5xl sm:text-6xl lg:text-[76px] font-semibold leading-[0.98] tracking-[-0.045em] max-w-4xl">
                A flash sale
                <br />
                <span className="text-[#a8c4c8]">
                  that doesn't lie.
                </span>
              </h1>

              <p className="stockflow-reveal-3 text-[#8eafb3] text-base lg:text-lg max-w-xl mt-7 leading-relaxed">
                Hundreds of buyers can hit{" "}
                <span className="text-white font-medium">
                  BUY
                </span>{" "}
                at exactly the same moment. StockFlow handles the traffic,
                protects inventory, and keeps checkout honest.
              </p>

              <div className="stockflow-reveal-4 flex flex-wrap items-center gap-3 mt-9">

                <button
                  type="button"
                  onClick={() => navigate("/drops")}
                  className="group flex items-center gap-2 bg-[#f9b223] text-[#013f46] font-semibold px-6 py-3.5 rounded-lg hover:bg-[#ffc44e] transition-all"
                >
                  Enter the live drop

                  <ArrowRight
                    size={17}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const element =
                      document.getElementById("how-it-works");

                    if (element) {
                      element.scrollIntoView({
                        behavior: "smooth",
                      });
                    }
                  }}
                  className="flex items-center gap-2 text-[#a8c4c8] hover:text-white font-medium px-5 py-3.5 transition-colors"
                >
                  See how it works

                  <ArrowDown size={15} />
                </button>

              </div>

              <div className="stockflow-reveal-4 flex flex-wrap gap-2 mt-10">

                {stack.map((item) => (
                  <span
                    key={item}
                    className="font-mono text-[10px] text-[#7fa1a6] border border-[#123a40] bg-[#061d21]/50 rounded-md px-2.5 py-1.5"
                  >
                    {item}
                  </span>
                ))}

              </div>

            </div>

            {/* ==================================================
               TELEMETRY CARD
            ================================================== */}

            <div className="relative stockflow-float px-10 mx-3 translate-y-4">

              <div className="absolute px-10 -inset-6 bg-[#013f46]/20 blur-3xl rounded-full " />

              <div className="relative border border-[#15434a] bg-[#061d21]/95 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl">

                {/* Card header */}
                <div className="px-9 py-4 border-b border-[#123a40] flex items-center justify-between">

                  <div className="flex items-center gap-2">

                    <Radio
                      size={14}
                      className="text-[#f9b223]"
                    />

                    <span className="font-mono text-[10px] tracking-[0.16em] text-[#a8c4c8]">
                      LIVE DROP / SYSTEM TELEMETRY
                    </span>

                  </div>

                  <span className="flex items-center gap-1.5 text-[9px] font-mono text-[#83a5aa]">

                    <span className="w-1.5 h-1.5 rounded-full bg-[#66d68b] stockflow-pulse" />

                    OPERATIONAL

                  </span>

                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2">

                  <TelemetryMetric
                    label="REQUESTS / SEC"
                    value={requests.toLocaleString()}
                    accent
                  />

                  <TelemetryMetric
                    label="ACTIVE BUYERS"
                    value={buyers.toLocaleString()}
                  />

                  <TelemetryMetric
                    label="STOCK REMAINING"
                    value={stock}
                  />

                  <TelemetryMetric
                    label="RESERVED"
                    value={reserved}
                  />

                </div>

                {/* Traffic */}
                <div className="p-5 border-t border-[#123a40]">

                  <div className="flex items-center justify-between mb-4">

                    <div>
                      <p className="font-mono text-[9px] text-[#668b90] tracking-[0.16em]">
                        REQUEST TRAFFIC
                      </p>

                      <p className="text-xs text-[#a8c4c8] mt-1">
                        Live incoming demand
                      </p>
                    </div>

                    <span className="font-mono text-[10px] text-[#f9b223]">
                      +18.4%
                    </span>

                  </div>

                  <div className="h-32 relative">

                    <div className="absolute inset-0 flex flex-col justify-between opacity-30">

                      <div className="border-t border-[#467278]" />
                      <div className="border-t border-[#467278]" />
                      <div className="border-t border-[#467278]" />
                      <div className="border-t border-[#467278]" />

                    </div>

                    <svg
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                      className="absolute inset-0 w-full h-full"
                    >
                      <polyline
                        points={graphPoints}
                        fill="none"
                        stroke="#f9b223"
                        strokeWidth="1"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>

                  </div>

                </div>

                {/* Stock */}
                <div className="p-5 border-t border-[#123a40]">

                  <div className="flex justify-between items-end mb-2">

                    <div>
                      <p className="font-mono text-[9px] text-[#668b90] tracking-[0.16em]">
                        INVENTORY
                      </p>

                      <p className="text-xs text-[#a8c4c8] mt-1">
                        Live available stock
                      </p>
                    </div>

                    <span className="font-mono text-sm text-white">
                      {stock}
                      <span className="text-[#668b90]">
                        {" "}
                        / {totalStock}
                      </span>
                    </span>

                  </div>

                  <div className="h-1.5 bg-[#0d3035] rounded-full overflow-hidden">

                    <div
                      className="h-full bg-[#f9b223] rounded-full transition-all duration-700"
                      style={{
                        width: `${stockPercentage}%`,
                      }}
                    />

                  </div>

                  <div className="flex justify-between mt-2">

                    <span className="text-[9px] font-mono text-[#587c81]">
                      RESERVED {reserved}
                    </span>

                    <span className="text-[9px] font-mono text-[#587c81]">
                      {stockPercentage}% AVAILABLE
                    </span>

                  </div>

                </div>

                {/* Events */}
                <div className="p-5 border-t border-[#123a40]">

                  <div className="flex items-center justify-between mb-3">

                    <span className="font-mono text-[9px] tracking-[0.16em] text-[#668b90]">
                      LIVE EVENTS
                    </span>

                    <span className="text-[9px] font-mono text-[#4f7075]">
                      SOCKET.IO
                    </span>

                  </div>

                  <div className="space-y-2">

                    {events.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center gap-2.5 text-[10px]"
                      >

                        <span
                          className={
                            event.color === "amber"
                              ? "w-1.5 h-1.5 rounded-full bg-[#f9b223] shrink-0"
                              : event.color === "green"
                              ? "w-1.5 h-1.5 rounded-full bg-[#66d68b] shrink-0"
                              : "w-1.5 h-1.5 rounded-full bg-[#607f83] shrink-0"
                          }
                        />

                        <span className="font-mono text-[#63868b]">
                          {event.buyer}
                        </span>

                        <span className="text-[#9bb7ba] truncate">
                          {event.text}
                        </span>

                      </div>
                    ))}

                  </div>

                </div>

              </div>

            </div>

          </div>

          <div className="mt-16 lg:mt-24 flex items-center gap-4 text-[10px] font-mono text-[#50757a]">

            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#19434a] to-transparent" />

            <span>
              500 BUYERS CAN CLICK AT ONCE
            </span>

            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#19434a] to-transparent" />

          </div>

        </div>

      </section>

      {/* ========================================================
         PROBLEM
      ======================================================== */}

      <section className="relative bg-[#f5f8f7] text-[#013f46] py-24 lg:py-32">

        <div className="max-w-7xl mx-auto px-6 lg:px-8">

          <div className="max-w-3xl">

            <p className="font-mono text-[10px] tracking-[0.2em] text-[#8b7137] mb-4">
              THE PROBLEM
            </p>

            <h2 className="text-4xl lg:text-5xl font-semibold tracking-[-0.035em] leading-tight">
              What happens when
              <br />
              <span className="text-[#759296]">
                everyone clicks BUY?
              </span>
            </h2>

            <p className="text-[#607b80] mt-5 text-base leading-relaxed max-w-2xl">
              Normal applications work beautifully when traffic is normal.
              Flash sales aren't normal. The hard part isn't rendering a
              button — it's making sure hundreds of simultaneous requests
              don't corrupt the truth.
            </p>

          </div>

          {/* Architecture flow */}

          <div className="mt-16 border border-[#d9e2e0] bg-white rounded-3xl overflow-hidden shadow-sm">

            <div className="p-6 lg:p-10">

              <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">

                <ProblemNode
                  icon={Users}
                  title="500"
                  subtitle="BUYERS"
                />

                <ProblemArrow />

                <ProblemNode
                  icon={Radio}
                  title="REQUESTS"
                  subtitle="CONCURRENT"
                />

                <ProblemArrow />

                <ProblemNode
                  icon={Database}
                  title="REDIS"
                  subtitle="ATOMIC CHECK"
                  warning
                />

                <ProblemArrow />

                <ProblemNode
                  icon={Check}
                  title="ONE TRUTH"
                  subtitle="STOCK RESERVED"
                  success
                />

              </div>

            </div>

            <div className="bg-[#f8faf9] border-t border-[#e2e9e7] px-6 lg:px-10 py-5 flex flex-col sm:flex-row justify-between gap-3">

              <span className="font-mono text-[9px] text-[#718b8f] tracking-[0.12em]">
                500 REQUESTS
              </span>

              <span className="font-mono text-[9px] text-[#27804b] tracking-[0.12em]">
                NO OVERSOLD INVENTORY
              </span>

            </div>

          </div>

        </div>

      </section>

      {/* ========================================================
         THREE BUGS
      ======================================================== */}

      <section className="bg-white text-[#013f46] py-24 lg:py-32">

        <div className="max-w-7xl mx-auto px-6 lg:px-8">

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14">

            <div>

              <p className="font-mono text-[10px] tracking-[0.2em] text-[#a06a00] mb-4">
                FAILURE MODES
              </p>

              <h2 className="text-4xl lg:text-5xl font-semibold tracking-[-0.035em]">
                Three bugs.
                <br />
                <span className="text-[#829a9d]">
                  Three fixes.
                </span>
              </h2>

            </div>

            <p className="text-[#71888c] text-sm max-w-md leading-relaxed">
              These are the exact classes of failures that appear when
              normal web architecture meets abnormal traffic.
            </p>

          </div>

          <div className="space-y-5">

            {bugFixes.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.number}
                  className="group border border-[#e0e7e5] bg-white rounded-2xl overflow-hidden hover:border-[#c9d7d5] hover:shadow-[0_15px_50px_rgba(1,63,70,.06)] transition-all duration-300"
                >

                  <div className="grid lg:grid-cols-[90px_1fr_80px_1fr] items-center">

                    {/* Number */}
                    <div className="p-6 lg:p-8 lg:border-r border-[#e7eceb]">

                      <span className="font-mono text-xs text-[#a0b0b2]">
                        {item.number}
                      </span>

                      <p className="font-mono text-[8px] tracking-[0.15em] text-[#a06a00] mt-2">
                        {item.label}
                      </p>

                    </div>

                    {/* Bug */}
                    <div className="p-6 lg:p-8">

                      <p className="font-mono text-[8px] tracking-[0.14em] text-[#a0afb1] mb-2">
                        THE BUG
                      </p>

                      <p className="text-sm lg:text-base text-[#4e6569] italic leading-relaxed">
                        {item.bug}
                      </p>

                    </div>

                    {/* Arrow */}
                    <div className="hidden lg:flex justify-center">

                      <div className="w-10 h-10 rounded-full bg-[#f9b223]/10 flex items-center justify-center group-hover:bg-[#f9b223]/20 transition-colors">

                        <ArrowRight
                          size={16}
                          className="text-[#a06a00]"
                        />

                      </div>

                    </div>

                    {/* Fix */}
                    <div className="p-6 lg:p-8 bg-[#f8faf9] border-t lg:border-t-0 lg:border-l border-[#e7eceb]">

                      <div className="flex items-start justify-between gap-5">

                        <div>

                          <p className="font-mono text-[8px] tracking-[0.14em] text-[#a0afb1] mb-2">
                            THE FIX
                          </p>

                          <p className="font-semibold text-sm text-[#013f46]">
                            {item.fix}
                          </p>

                          <p className="text-sm text-[#6c8387] mt-2 leading-relaxed">
                            {item.detail}
                          </p>

                        </div>

                        <Icon
                          size={20}
                          className="text-[#013f46] shrink-0 mt-1"
                        />

                      </div>

                      <div className="flex items-end gap-2 mt-5">

                        <span className="font-mono text-xl font-semibold text-[#013f46]">
                          {item.metric}
                        </span>

                        <span className="font-mono text-[8px] text-[#8a9fa2] mb-1">
                          {item.metricLabel}
                        </span>

                      </div>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>

        </div>

      </section>

      {/* ========================================================
         HOW IT WORKS
      ======================================================== */}

      <section
        id="how-it-works"
        className="relative bg-[#04161a] py-24 lg:py-32 overflow-hidden"
      >

        <div className="absolute inset-0 stockflow-grid opacity-70 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto">

            <p className="font-mono text-[10px] tracking-[0.2em] text-[#f9b223] mb-4">
              UNDER THE HOOD
            </p>

            <h2 className="text-4xl lg:text-5xl font-semibold tracking-[-0.035em]">
              The click is simple.
              <br />
              <span className="text-[#78999e]">
                The infrastructure isn't.
              </span>
            </h2>

            <p className="text-[#79999e] mt-5 leading-relaxed">
              Every purchase travels through an atomic inventory check before
              the system tells the buyer that their stock is real.
            </p>

          </div>

          {/* Architecture row */}

          <div className="mt-20">

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">

              <ArchitectureNode
                icon={Users}
                title="BUYERS"
                subtitle="Hundreds at once"
              />

              <ArchitectureConnector />

              <ArchitectureNode
                icon={Server}
                title="NODE / EXPRESS"
                subtitle="Request gateway"
              />

              <ArchitectureConnector />

              <ArchitectureNode
                icon={Database}
                title="REDIS + LUA"
                subtitle="Atomic inventory"
                active
              />

            </div>

            {/* Down connection */}

            <div className="hidden md:flex justify-center py-8">

              <div className="h-12 w-px bg-gradient-to-b from-[#1c555d] to-[#f9b223]/40 relative overflow-hidden">

                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-3 rounded-full bg-[#f9b223] animate-[flowDown_1.5s_linear_infinite]"
                />

              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">

              <ArchitectureNode
                icon={LockKeyhole}
                title="RESERVATION"
                subtitle="5-minute TTL"
              />

              <ArchitectureConnector />

              <ArchitectureNode
                icon={Radio}
                title="SOCKET.IO"
                subtitle="Live inventory"
              />

              <ArchitectureConnector />

              <ArchitectureNode
                icon={Check}
                title="CONFIRMED"
                subtitle="One source of truth"
                success
              />

            </div>

          </div>

          {/* Lua explanation */}

          <div className="mt-16 max-w-3xl mx-auto border border-[#15434a] bg-[#061e22] rounded-2xl overflow-hidden">

            <div className="px-5 py-3 border-b border-[#15434a] flex items-center justify-between">

              <span className="font-mono text-[9px] text-[#6c9095] tracking-[0.16em]">
                ATOMIC INVENTORY OPERATION
              </span>

              <span className="flex items-center gap-1.5 font-mono text-[9px] text-[#67c987]">
                <Check size={11} />
                SAFE
              </span>

            </div>

            <div className="p-5 lg:p-7 font-mono text-[11px] sm:text-xs leading-7 overflow-x-auto">

              <div>
                <span className="text-[#567f85]">01</span>{" "}
                <span className="text-[#a8c4c8]">if</span>{" "}
                <span className="text-[#f9b223]">stock</span>{" "}
                <span className="text-[#a8c4c8]">&gt;</span>{" "}
                <span className="text-[#f4faf9]">0</span>
              </div>

              <div>
                <span className="text-[#567f85]">02</span>{" "}
                <span className="text-[#a8c4c8]">then</span>{" "}
                <span className="text-[#67c987]">
                  reserve()
                </span>
              </div>

              <div>
                <span className="text-[#567f85]">03</span>{" "}
                <span className="text-[#a8c4c8]">and</span>{" "}
                <span className="text-[#67c987]">
                  decrement()
                </span>
              </div>

              <div>
                <span className="text-[#567f85]">04</span>{" "}
                <span className="text-[#a8c4c8]">else</span>{" "}
                <span className="text-[#e08484]">
                  reject()
                </span>
              </div>

              <div className="mt-3 pt-3 border-t border-[#15434a] text-[#668b90]">

                <span className="text-[#67c987]">
                  ✓
                </span>{" "}

                Check + decrement happen as one indivisible operation.

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ========================================================
         LIVE STATS
      ======================================================== */}

      <section className="bg-[#f5f8f7] py-24 lg:py-28 text-[#013f46]">

        <div className="max-w-7xl mx-auto px-6 lg:px-8">

          <div className="grid md:grid-cols-3 gap-5">

            <StatCard
              icon={Zap}
              eyebrow="LIVE TRAFFIC"
              value={requests.toLocaleString()}
              suffix="/s"
              description="Incoming requests being handled right now."
            />

            <StatCard
              icon={ShoppingCart}
              eyebrow="INVENTORY"
              value={stock}
              suffix=" units"
              description="Stock remaining without overselling."
            />

            <StatCard
              icon={Clock3}
              eyebrow="RESERVATIONS"
              value={reserved}
              suffix=" active"
              description="Inventory temporarily held for buyers."
            />

          </div>

        </div>

      </section>

      {/* ========================================================
         FEATURES
      ======================================================== */}

      <section className="bg-white py-24 lg:py-32 text-[#013f46]">

        <div className="max-w-7xl mx-auto px-6 lg:px-8">

          <div className="max-w-2xl">

            <p className="font-mono text-[10px] tracking-[0.2em] text-[#a06a00] mb-4">
              DESIGNED FOR THE DROP
            </p>

            <h2 className="text-4xl lg:text-5xl font-semibold tracking-[-0.035em]">
              Not a prettier checkout.
              <br />
              <span className="text-[#83999c]">
                A safer one.
              </span>
            </h2>

          </div>

          <div className="grid md:grid-cols-3 gap-5 mt-14">

            <FeatureCard
              icon={Zap}
              title="Live everywhere"
              description="Stock counts update through WebSockets so every buyer sees the same reality."
            />

            <FeatureCard
              icon={ShieldCheck}
              title="Provably safe"
              description="The admin console can simulate hundreds of concurrent buyers and expose race conditions."
            />

            <FeatureCard
              icon={Timer}
              title="No silent waiting"
              description="Reservations have explicit TTLs. A hold either exists, expires, or becomes a purchase."
            />

          </div>

        </div>

      </section>

      {/* ========================================================
         FINAL CTA
      ======================================================== */}

      <section className="relative bg-[#013f46] overflow-hidden">

        <div className="absolute inset-0 stockflow-grid opacity-30 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-28">

          <div className="grid lg:grid-cols-[1fr_auto] gap-12 items-center">

            <div>

              <div className="flex items-center gap-2 mb-5">

                <span className="relative flex h-2 w-2">

                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#f9b223] stockflow-pulse" />

                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f9b223]" />

                </span>

                <span className="font-mono text-[10px] tracking-[0.18em] text-[#9ab7ba]">
                  DROP IS LIVE
                </span>

              </div>

              <h2 className="text-4xl lg:text-5xl font-semibold tracking-[-0.035em] text-white">
                Don't read about it.
                <br />
                <span className="text-[#8eb0b4]">
                  Stress it.
                </span>
              </h2>

              <p className="text-[#8eafb3] mt-5 max-w-xl leading-relaxed">
                Enter the buyer experience and watch inventory move in
                real-time. Or open the admin console and simulate the traffic
                yourself.
              </p>

            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3">

              <button
                type="button"
                onClick={() => navigate("/drops")}
                className="group flex items-center justify-center gap-2 bg-[#f9b223] text-[#013f46] font-semibold px-7 py-3.5 rounded-lg hover:bg-[#ffc44e] transition-all whitespace-nowrap"
              >
                Enter as buyer

                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />

              </button>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="flex items-center justify-center gap-2 border border-white/20 text-white font-medium px-7 py-3.5 rounded-lg hover:bg-white/5 transition-colors whitespace-nowrap"
              >
                Open admin console

                <ChevronRight size={15} />

              </button>

            </div>

          </div>

        </div>

      </section>

      {/* ========================================================
         FOOTER
      ======================================================== */}

      <footer className="bg-[#04161a] border-t border-[#12373d]">

        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-7 flex flex-col sm:flex-row items-center justify-between gap-4">

          <div className="flex items-center gap-2">

            <img
              src={stockFlowLogo}
              alt="StockFlow"
              className="w-6 h-6 object-contain"
            />

            <span className="text-sm font-semibold text-[#d9e8e9]">
              StockFlow
            </span>

          </div>

          <div className="flex items-center gap-3 font-mono text-[9px] text-[#50757a]">

            <span>REDIS</span>
            <span>•</span>
            <span>LUA</span>
            <span>•</span>
            <span>SOCKET.IO</span>
            <span>•</span>
            <span>MONGODB</span>

          </div>

          <span className="font-mono text-[9px] text-[#405f64]">
            BUILT FOR THE DROP
          </span>

        </div>

      </footer>

    </div>
  );
};

/* ============================================================
   TELEMETRY METRIC
============================================================ */

const TelemetryMetric = ({
  label,
  value,
  accent = false,
}) => {
  return (
    <div className="p-5 border-b border-[#123a40] odd:border-r">

      <p className="font-mono text-[8px] tracking-[0.16em] text-[#668b90]">
        {label}
      </p>

      <p
        key={String(value)}
        className={`stockflow-number font-mono text-2xl font-semibold mt-2 ${
          accent
            ? "text-[#f9b223]"
            : "text-[#e7f1f1]"
        }`}
      >
        {value}
      </p>

    </div>
  );
};

/* ============================================================
   PROBLEM NODE
============================================================ */

const ProblemNode = ({
  icon: Icon,
  title,
  subtitle,
  warning = false,
  success = false,
}) => {
  let containerClass =
    "border-[#dce6e4] bg-[#f7faf9]";

  let iconClass =
    "bg-[#013f46]/[0.05] text-[#013f46]";

  let titleClass =
    "text-[#013f46]";

  if (warning) {
    containerClass =
      "border-[#e7d7ae] bg-[#fffaf0]";

    iconClass =
      "bg-[#f9b223]/10 text-[#a06a00]";

    titleClass =
      "text-[#795b1b]";
  }

  if (success) {
    containerClass =
      "border-[#c9dfd0] bg-[#f4fbf6]";

    iconClass =
      "bg-[#66d68b]/10 text-[#27804b]";

    titleClass =
      "text-[#216b40]";
  }

  return (
    <div
      className={`rounded-2xl border p-6 text-center ${containerClass}`}
    >

      <div
        className={`w-11 h-11 rounded-xl mx-auto flex items-center justify-center mb-3 ${iconClass}`}
      >
        <Icon size={19} />
      </div>

      <p
        className={`font-mono text-[10px] font-semibold ${titleClass}`}
      >
        {title}
      </p>

      <p className="font-mono text-[8px] text-[#789095] mt-1">
        {subtitle}
      </p>

    </div>
  );
};

/* ============================================================
   PROBLEM ARROW
============================================================ */

const ProblemArrow = () => {
  return (
    <div className="hidden md:flex items-center justify-center">

      <div className="w-full h-px bg-[#d5dfdd]" />

      <ArrowRight
        size={14}
        className="text-[#9baaa8] shrink-0 -ml-1"
      />

    </div>
  );
};

/* ============================================================
   ARCHITECTURE NODE
============================================================ */

const ArchitectureNode = ({
  icon: Icon,
  title,
  subtitle,
  active = false,
  success = false,
}) => {
  let containerClass =
    "border-[#16424a] bg-[#061d21]";

  let iconClass =
    "bg-[#0c3035] text-[#89a9ad]";

  let titleClass =
    "text-[#c1d4d6]";

  if (active) {
    containerClass =
      "border-[#8a641c] bg-[#f9b223]/[0.06]";

    iconClass =
      "bg-[#f9b223]/10 text-[#f9b223]";

    titleClass =
      "text-[#f9b223]";
  }

  if (success) {
    containerClass =
      "border-[#286247] bg-[#66d68b]/[0.035]";

    iconClass =
      "bg-[#66d68b]/10 text-[#66d68b]";

    titleClass =
      "text-[#66d68b]";
  }

  return (
    <div
      className={`relative rounded-2xl border p-6 text-center ${containerClass}`}
    >

      <div
        className={`w-10 h-10 rounded-xl mx-auto flex items-center justify-center mb-4 ${iconClass}`}
      >
        <Icon size={18} />
      </div>

      <p
        className={`font-mono text-[10px] font-semibold ${titleClass}`}
      >
        {title}
      </p>

      <p className="font-mono text-[8px] text-[#5c7f84] mt-1">
        {subtitle}
      </p>

      {active && (
        <span className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-[#f9b223] stockflow-pulse" />
      )}

    </div>
  );
};

/* ============================================================
   ARCHITECTURE CONNECTOR
============================================================ */

const ArchitectureConnector = () => {
  return (
    <div className="hidden md:flex items-center justify-center relative h-8">

      <div className="w-full h-px bg-gradient-to-r from-[#16424a] via-[#2a626a] to-[#16424a]" />

      <span
        className="absolute left-0 w-1.5 h-1.5 rounded-full bg-[#f9b223] shadow-[0_0_8px_rgba(249,178,35,.7)] animate-[flowRight_1.8s_linear_infinite]"
      />

      <ArrowRight
        size={13}
        className="absolute right-0 text-[#567f85]"
      />

    </div>
  );
};

/* ============================================================
   STAT CARD
============================================================ */

const StatCard = ({
  icon: Icon,
  eyebrow,
  value,
  suffix,
  description,
}) => {
  return (
    <div className="group border border-[#dce5e3] bg-white rounded-2xl p-7 hover:border-[#c7d5d2] hover:shadow-[0_15px_45px_rgba(1,63,70,.06)] transition-all duration-300">

      <div className="flex items-center justify-between">

        <div className="w-10 h-10 rounded-xl bg-[#013f46]/[0.05] flex items-center justify-center">
          <Icon
            size={18}
            className="text-[#013f46]"
          />
        </div>

        <span className="flex items-center gap-1.5 font-mono text-[8px] text-[#5f9b70]">

          <span className="w-1.5 h-1.5 rounded-full bg-[#5fba78] stockflow-pulse" />

          LIVE

        </span>

      </div>

      <p className="font-mono text-[9px] tracking-[0.16em] text-[#91a3a5] mt-7">
        {eyebrow}
      </p>

      <div className="flex items-baseline gap-2 mt-2">

        <span className="font-mono text-4xl font-semibold text-[#013f46]">
          {value}
        </span>

        <span className="font-mono text-[10px] text-[#829699]">
          {suffix}
        </span>

      </div>

      <p className="text-sm text-[#718589] leading-relaxed mt-3">
        {description}
      </p>

    </div>
  );
};

/* ============================================================
   FEATURE CARD
============================================================ */

const FeatureCard = ({
  icon: Icon,
  title,
  description,
}) => {
  return (
    <div className="group border border-[#e0e8e6] rounded-2xl p-7 hover:border-[#c9d8d5] hover:-translate-y-1 transition-all duration-300">

      <div className="w-10 h-10 rounded-xl bg-[#013f46]/[0.05] flex items-center justify-center group-hover:bg-[#f9b223]/10 transition-colors">

        <Icon
          size={18}
          className="text-[#013f46] group-hover:text-[#a06a00] transition-colors"
        />

      </div>

      <h3 className="font-semibold text-[#013f46] mt-6">
        {title}
      </h3>

      <p className="text-sm text-[#718589] leading-relaxed mt-2">
        {description}
      </p>

    </div>
  );
};

export default LandingPage;