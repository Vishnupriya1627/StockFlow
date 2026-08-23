import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Bell,
  SlidersHorizontal,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Radio,
  ChevronDown,
} from "lucide-react";
import AlertItem from "./AlertItem";
import { getAllAlerts } from "../../api/alertsApi";
import { mapAlertToItem } from "../../utils/alertTransform";

const alertTypeFilters = [
  "All",
  "low_stock",
  "out_of_stock",
  "overstock",
  "shipment_delayed",
];

const alertSeverityFilters = ["All", "info", "warning", "critical"];

const Alerts = () => {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All");
  const [severity, setSeverity] = useState("All");
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    getAllAlerts()
      .then((data) => setAlerts(data.map(mapAlertToItem)))
      .catch((err) => {
        console.error("Failed to fetch alerts:", err);
        setError("Could not load alerts.");
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      const search = query.toLowerCase();

      const matchesQuery =
        a.title.toLowerCase().includes(search) ||
        a.message.toLowerCase().includes(search);

      const matchesType = type === "All" || a.type === type;
      const matchesSeverity = severity === "All" || a.severity === severity;

      return matchesQuery && matchesType && matchesSeverity;
    });
  }, [alerts, query, type, severity]);

  const activeCount = alerts.filter((a) => !a.resolved).length;
  const resolvedCount = alerts.filter((a) => a.resolved).length;

  const criticalCount = alerts.filter(
    (a) => !a.resolved && a.severity === "critical",
  ).length;

  const warningCount = alerts.filter(
    (a) => !a.resolved && a.severity === "warning",
  ).length;

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
      `}</style>

      {/* ============================================================
          BACKGROUND
      ============================================================ */}

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(
              rgba(168, 196, 200, 0.045) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(168, 196, 200, 0.045) 1px,
              transparent 1px
            )
          `,
          backgroundSize: "40px 40px",
          animation: "gridMove 20s linear infinite",
        }}
      />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute left-[8%] top-[5%] w-72 h-72 rounded-full bg-[#013f46]/40 blur-[110px]" />

        <div className="absolute right-[4%] top-[20%] w-80 h-80 rounded-full bg-[#f9b223]/[0.035] blur-[120px]" />

        <div className="absolute left-[40%] bottom-[8%] w-80 h-80 rounded-full bg-[#013f46]/30 blur-[130px]" />
      </div>

      {/* ============================================================
          MAIN
      ============================================================ */}

      <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-10 lg:py-14">
        {/* ========================================================
            HEADER
        ======================================================== */}

        <div
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12"
          style={{
            animation: "revealUp 0.7s ease-out both",
          }}
        >
          <div>
            {/* Status badge */}

            <div className="inline-flex items-center gap-2 border border-[#17444a] bg-[#061e22]/75 backdrop-blur-sm rounded-full px-3 py-1.5 mb-6">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#f9b223] animate-pulse" />

                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#f9b223]" />
              </span>

              <span className="font-mono text-[9px] tracking-[0.16em] text-[#a8c4c8]">
                OPERATIONS MONITOR
              </span>
            </div>

            <p className="font-mono text-[10px] tracking-[0.22em] text-[#f9b223] mb-4">
              SYSTEM EVENTS
            </p>

            <h1 className="text-5xl lg:text-[64px] font-semibold leading-[0.98] tracking-[-0.045em]">
              System
              <br />
              <span className="text-[#78999e]">Alerts.</span>
            </h1>

            <p className="text-[#8eafb3] text-sm lg:text-base mt-6 max-w-2xl leading-relaxed">
              Monitor inventory events, concurrency warnings, and operational
              anomalies across the StockFlow system.
            </p>
          </div>

          {/* Header right */}

          <div className="flex items-center gap-2 border border-[#17444a] bg-[#061e22]/80 rounded-lg px-3 py-2.5 self-start lg:self-auto">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#66d68b] animate-pulse" />

              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#66d68b]" />
            </span>

            <span className="font-mono text-[9px] tracking-[0.12em] text-[#83a5aa]">
              ALERT STREAM ACTIVE
            </span>
          </div>
        </div>

        {/* ========================================================
            TELEMETRY SUMMARY
        ======================================================== */}

        <div
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10"
          style={{
            animation: "revealUp 0.7s 0.08s ease-out both",
          }}
        >
          <AlertMetric
            icon={Bell}
            eyebrow="ACTIVE ALERTS"
            value={activeCount}
            description="Events currently requiring attention."
            accent
          />

          <AlertMetric
            icon={AlertTriangle}
            eyebrow="CRITICAL"
            value={criticalCount}
            description="High priority operational events."
            danger
          />

          <AlertMetric
            icon={Activity}
            eyebrow="WARNINGS"
            value={warningCount}
            description="Potential issues detected."
          />

          <AlertMetric
            icon={CheckCircle2}
            eyebrow="RESOLVED"
            value={resolvedCount}
            description="Previously handled system events."
            success
          />
        </div>

        {/* ========================================================
            FILTER SECTION
        ======================================================== */}

        <section
          className="relative border border-[#15434a] bg-[#061d21]/95 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl"
          style={{
            animation: "revealUp 0.7s 0.12s ease-out both",
          }}
        >
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-[#013f46]/10 via-transparent to-[#f9b223]/[0.015]" />

          {/* Section header */}

          <div className="relative px-6 lg:px-7 py-4 border-b border-[#123a40] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-[#f9b223]" />

              <span className="font-mono text-[9px] tracking-[0.16em] text-[#a8c4c8]">
                ALERT FILTERS
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Radio size={11} className="text-[#66d68b]" />

              <span className="font-mono text-[8px] text-[#587b80]">
                LIVE EVENT STREAM
              </span>
            </div>
          </div>

          {/* Filters */}

          <div className="relative p-6 lg:p-7">
            <div className="grid lg:grid-cols-[1fr_auto_auto] gap-4 items-end">
              {/* Search */}

              <div>
                <label className="font-mono text-[9px] tracking-[0.14em] text-[#668b90] block mb-2">
                  SEARCH EVENTS
                </label>

                <div className="relative">
                  <Search
                    size={15}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#668b90]"
                  />

                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search alert title or message..."
                    className="w-full text-sm border border-[#17444a] rounded-xl pl-11 pr-4 py-3 outline-none bg-[#04181c] text-[#d8e8e9] placeholder:text-[#54777c] focus:border-[#f9b223]/60 transition-colors"
                  />
                </div>
              </div>

              {/* Type */}

              <div>
                <label className="font-mono text-[9px] tracking-[0.14em] text-[#668b90] block mb-2">
                  EVENT TYPE
                </label>

                <div className="relative">
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="appearance-none text-sm border border-[#17444a] rounded-xl px-4 pr-10 py-3 outline-none bg-[#04181c] text-[#d8e8e9] focus:border-[#f9b223]/60 transition-colors"
                  >
                    {alertTypeFilters.map((t) => (
                      <option
                        key={t}
                        value={t}
                        className="bg-[#061d21] text-white"
                      >
                        {t === "All" ? "All Event Types" : t.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6e9095]"
                  />
                </div>
              </div>

              {/* Severity */}

              <div>
                <label className="font-mono text-[9px] tracking-[0.14em] text-[#668b90] block mb-2">
                  SEVERITY
                </label>

                <div className="relative">
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="appearance-none text-sm border border-[#17444a] rounded-xl px-4 pr-10 py-3 outline-none bg-[#04181c] text-[#d8e8e9] focus:border-[#f9b223]/60 transition-colors"
                  >
                    {alertSeverityFilters.map((s) => (
                      <option
                        key={s}
                        value={s}
                        className="bg-[#061d21] text-white"
                      >
                        {s === "All"
                          ? "All Severities"
                          : s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6e9095]"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            ALERT TELEMETRY HEADER
        ======================================================== */}

        <div className="mt-12 flex items-center gap-4">
          <span className="font-mono text-[9px] tracking-[0.18em] text-[#668b90]">
            ALERT TELEMETRY
          </span>

          <div className="h-px flex-1 bg-gradient-to-r from-[#19434a] to-transparent" />

          <span className="font-mono text-[8px] text-[#66b47e] flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#66d68b] animate-pulse" />

              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#66d68b]" />
            </span>
            MONITORING
          </span>
        </div>

        {/* ========================================================
            ALERT LIST
        ======================================================== */}

        {loading ? (
          <div className="mt-5 border border-[#15434a] bg-[#061d21]/95 rounded-2xl py-20 text-center">
            <p className="font-mono text-[9px] tracking-[0.14em] text-[#668b90]">
              LOADING ALERTS...
            </p>
          </div>
        ) : error ? (
          <div className="mt-5 border border-[#5b3035] bg-[#24171a]/90 rounded-2xl py-20 text-center">
            <p className="font-mono text-[9px] tracking-[0.14em] text-[#e08484]">
              {error}
            </p>
          </div>
        ) : filteredAlerts.length > 0 ? (
          <div className="space-y-4 mt-5">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className="group transition-all duration-300 hover:-translate-y-0.5"
              >
                <AlertItem alert={alert} />
              </div>
            ))}
          </div>
        ) : (
          /* ========================================================
             EMPTY STATE
          ======================================================== */

          <div className="relative mt-5 border border-[#15434a] bg-[#061d21]/95 rounded-2xl overflow-hidden shadow-xl">
            <div className="h-px bg-gradient-to-r from-transparent via-[#f9b223]/50 to-transparent" />

            <div className="py-20 px-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#f9b223]/[0.07] border border-[#f9b223]/10 flex items-center justify-center mx-auto mb-6">
                <Bell size={24} className="text-[#f9b223]" />
              </div>

              <p className="font-mono text-[9px] tracking-[0.18em] text-[#668b90] mb-3">
                EVENT STATUS
              </p>

              <p className="text-base font-semibold text-[#dcebea]">
                No alerts match your filters.
              </p>

              <p className="text-xs text-[#6e9095] mt-2 max-w-md mx-auto leading-relaxed">
                Try adjusting the search query, event type, or severity filter
                to find additional alerts.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================
            SYSTEM GUARANTEE
        ======================================================== */}

        <div className="mt-6 border border-[#1e4a35] bg-[#04211a]/80 backdrop-blur-sm rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#66d68b]/10 border border-[#66d68b]/10 flex items-center justify-center shrink-0">
            <CheckCircle2 size={18} className="text-[#66d68b]" />
          </div>

          <div className="flex-1">
            <p className="font-mono text-[9px] tracking-[0.15em] text-[#66d68b]">
              MONITORING STATUS
            </p>

            <p className="text-sm text-[#8eafb3] mt-1">
              StockFlow is continuously monitoring system events and inventory
              operations.
            </p>
          </div>

          <div className="font-mono text-[10px] text-[#66d68b] whitespace-nowrap">
            ✓ STREAM HEALTHY
          </div>
        </div>

        {/* ========================================================
            FOOTER
        ======================================================== */}

        <div className="mt-12 flex items-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#19434a] to-transparent" />

          <span className="font-mono text-[8px] tracking-[0.16em] text-[#50757a]">
            STOCKFLOW / ALERTS / MONITOR
          </span>

          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#19434a] to-transparent" />
        </div>
      </main>
    </div>
  );
};

/* ============================================================
   ALERT METRIC
============================================================ */

const AlertMetric = ({
  icon: Icon,
  eyebrow,
  value,
  description,
  accent = false,
  danger = false,
  success = false,
}) => {
  let iconClasses = "bg-[#f4faf9]/[0.06] text-[#a8c4c8]";
  let valueClasses = "text-[#f4faf9]";

  if (accent) {
    iconClasses = "bg-[#f9b223]/[0.08] text-[#f9b223]";
    valueClasses = "text-[#f9b223]";
  }

  if (danger) {
    iconClasses = "bg-[#e08484]/[0.08] text-[#e08484]";
    valueClasses = "text-[#e08484]";
  }

  if (success) {
    iconClasses = "bg-[#66d68b]/[0.08] text-[#66d68b]";
    valueClasses = "text-[#66d68b]";
  }

  return (
    <div className="group relative border border-[#15434a] bg-[#061d21]/95 backdrop-blur-xl rounded-2xl p-6 hover:border-[#1d525a] hover:-translate-y-0.5 hover:shadow-2xl transition-all duration-300">
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-[#013f46]/10 via-transparent to-[#f9b223]/[0.015] rounded-2xl" />

      <div className="relative flex items-center justify-between">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconClasses}`}
        >
          <Icon size={18} />
        </div>

        <span className="flex items-center gap-1.5 font-mono text-[8px] text-[#66b47e]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#66d68b] animate-pulse" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#66d68b]" />
          </span>
          LIVE
        </span>
      </div>

      <p className="relative font-mono text-[9px] tracking-[0.16em] text-[#668b90] mt-7">
        {eyebrow}
      </p>

      <div className="relative flex items-baseline gap-2 mt-2">
        <span className={`font-mono text-3xl font-semibold ${valueClasses}`}>
          {value}
        </span>
      </div>

      <p className="relative text-xs text-[#8eafb3] leading-relaxed mt-3">
        {description}
      </p>
    </div>
  );
};

export default Alerts;
