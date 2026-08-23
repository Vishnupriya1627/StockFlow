import React, { useEffect, useState } from "react";
import StatCard from "./StatCard";
import StockTrendChart from "./StockTrendChart";
import CategoryBreakdownChart from "./CategoryBreakdownChart";
import RecentActivity from "./RecentActivity";
import {
  getDashboardSummary,
  getStockTrend,
  getCategoryBreakdown,
  getRecentActivity,
} from "../../api/dashboardApi";

const buildKpiStats = (summary) => [
  {
    id: "total-skus",
    label: "Total SKUs",
    value: summary.totalSKUs.value,
    change: `${summary.totalSKUs.changePct >= 0 ? "+" : ""}${summary.totalSKUs.changePct}%`,
    trend: summary.totalSKUs.changePct >= 0 ? "up" : "down",
  },
  {
    id: "low-stock",
    label: "Low Stock Items",
    value: summary.lowStockItems.value,
    change: `+${summary.lowStockItems.changeCount}`,
    trend: summary.lowStockItems.changeCount > 0 ? "down" : "up",
  },
  {
    id: "pending-orders",
    label: "Pending Orders",
    value: summary.pendingOrders.value,
    change: `${summary.pendingOrders.changePct >= 0 ? "+" : ""}${summary.pendingOrders.changePct}%`,
    trend: summary.pendingOrders.changePct <= 0 ? "up" : "down",
  },
  {
    id: "revenue",
    label: "Revenue (This Month)",
    value: summary.revenueThisMonth.value,
    change: `${summary.revenueThisMonth.changePct >= 0 ? "+" : ""}${summary.revenueThisMonth.changePct}%`,
    trend: summary.revenueThisMonth.changePct >= 0 ? "up" : "down",
    isCurrency: true,
  },
];

const Dashboard = () => {
  const [kpiStats, setKpiStats] = useState([]);
  const [stockTrend, setStockTrend] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [summary, trend, breakdown, activity] = await Promise.all([
          getDashboardSummary(),
          getStockTrend(7),
          getCategoryBreakdown(),
          getRecentActivity(5),
        ]);

        setKpiStats(buildKpiStats(summary));
        setStockTrend(trend);
        setCategoryBreakdown(breakdown);
        setRecentActivity(activity);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data. Is the backend running?");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-[#04161a] text-[#f4faf9] relative overflow-hidden">
        {/* Background grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-70"
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

        <div className="absolute left-[15%] top-[10%] w-96 h-96 rounded-full bg-[#013f46]/30 blur-[140px] pointer-events-none" />

        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center">
          <div className="relative mb-5">
            <div className="w-12 h-12 rounded-full border border-[#17444a]" />

            <div className="absolute inset-0 w-12 h-12 rounded-full border-t border-[#f9b223] animate-spin" />
          </div>

          <p className="font-mono text-[10px] tracking-[0.18em] text-[#78999e]">
            LOADING DASHBOARD
          </p>

          <p className="font-mono text-[8px] tracking-[0.12em] text-[#405f64] mt-2">
            SYNCING INVENTORY DATA...
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // ERROR
  // --------------------------------------------------

  if (error) {
    return (
      <div className="min-h-screen bg-[#04161a] text-[#f4faf9] relative overflow-hidden">
        {/* Background grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-70"
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

        <div className="absolute left-1/2 top-[25%] -translate-x-1/2 w-96 h-96 rounded-full bg-[#5b3035]/20 blur-[130px] pointer-events-none" />

        <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
          <div className="w-full max-w-lg border border-[#5b3035] bg-[#061d21]/95 rounded-2xl overflow-hidden">
            <div className="h-1 bg-[#e08484]" />

            <div className="p-8 text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-[#e08484]/10 border border-[#e08484]/20 flex items-center justify-center mb-5">
                <span className="text-[#e08484] text-lg">!</span>
              </div>

              <p className="font-mono text-[9px] tracking-[0.18em] text-[#e08484]">
                SYSTEM ERROR
              </p>

              <p className="text-sm text-[#a98287] mt-3">
                {error}
              </p>

              <p className="font-mono text-[8px] tracking-[0.12em] text-[#405f64] mt-5">
                CHECK BACKEND CONNECTION
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // DASHBOARD
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-[#04161a] text-[#f4faf9] relative overflow-hidden">
      {/* ======================================================
          BACKGROUND
      ====================================================== */}

      <div
        className="absolute inset-0 pointer-events-none opacity-70"
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

      {/* Ambient glows */}
      <div className="absolute left-[5%] top-[5%] w-96 h-96 rounded-full bg-[#013f46]/30 blur-[140px] pointer-events-none" />

      <div className="absolute right-[5%] top-[15%] w-96 h-96 rounded-full bg-[#f9b223]/[0.025] blur-[140px] pointer-events-none" />

      <div className="absolute left-[40%] bottom-[-10%] w-[500px] h-[500px] rounded-full bg-[#013f46]/20 blur-[150px] pointer-events-none" />

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-10 lg:py-12">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#67c987] opacity-60 animate-ping" />

                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#67c987]" />
              </span>

              <span className="font-mono text-[8px] tracking-[0.18em] text-[#78999e]">
                STOCKFLOW / CONTROL CENTER
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.045em] leading-tight">
              Inventory
              <br />
              <span className="text-[#78999e]">
                at a glance.
              </span>
            </h1>

            <p className="text-sm text-[#66868b] mt-4 max-w-xl">
              Real-time overview of inventory, stock movement, orders and
              revenue.
            </p>
          </div>

          <div
            className="
              self-start
              sm:self-auto
              flex
              items-center
              gap-2
              border
              border-[#17444a]
              bg-[#061e22]/75
              backdrop-blur-sm
              rounded-full
              px-3
              py-1.5
            "
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#67c987]" />

            <span className="font-mono text-[8px] tracking-[0.14em] text-[#78999e]">
              SYSTEM ONLINE
            </span>
          </div>
        </div>

        {/* ==================================================
            KPI SECTION
        ================================================== */}

        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-mono text-[8px] tracking-[0.18em] text-[#f9b223]">
                01 / KEY METRICS
              </p>
            </div>

            <span className="font-mono text-[8px] text-[#405f64]">
              LIVE OVERVIEW
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {kpiStats.map((stat) => (
              <div
                key={stat.id}
                className="
                  relative
                  rounded-xl
                  border
                  border-[#15434a]
                  bg-[#061d21]/90
                  backdrop-blur-xl
                  overflow-hidden
                  transition-all
                  duration-300
                  hover:border-[#24606a]
                  hover:-translate-y-0.5
                  shadow-[0_15px_40px_rgba(0,0,0,.15)]
                "
              >
                {/* Amber indicator */}
                <div className="absolute top-0 left-0 right-0 h-px bg-[#f9b223]/30" />

                <div className="p-1">
                  <StatCard {...stat} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ==================================================
            ANALYTICS SECTION
        ================================================== */}

        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-mono text-[8px] tracking-[0.18em] text-[#f9b223]">
                02 / ANALYTICS
              </p>
            </div>

            <span className="font-mono text-[8px] text-[#405f64]">
              LAST 7 DAYS
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div
              className="
                relative
                rounded-xl
                border
                border-[#15434a]
                bg-[#061d21]/90
                backdrop-blur-xl
                overflow-hidden
                min-h-[340px]
                shadow-[0_15px_40px_rgba(0,0,0,.15)]
              "
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-[#15434a]" />

              <div className="flex items-center justify-between px-5 pt-5">
                <div>
                  <p className="font-mono text-[8px] tracking-[0.15em] text-[#52777c]">
                    STOCK MOVEMENT
                  </p>

                  <p className="text-sm font-medium text-[#cbdcde] mt-1">
                    Stock Trend
                  </p>
                </div>

                <span className="font-mono text-[7px] tracking-[0.12em] text-[#405f64] border border-[#123a40] rounded-full px-2 py-1">
                  7D
                </span>
              </div>

              <div className="px-2 pb-3 pt-3">
                <StockTrendChart data={stockTrend} />
              </div>
            </div>

            {/* <div
              className="
                relative
                rounded-xl
                border
                border-[#15434a]
                bg-[#061d21]/90
                backdrop-blur-xl
                overflow-hidden
                min-h-[340px]
                shadow-[0_15px_40px_rgba(0,0,0,.15)]
              " > */}
              {/* <div className="absolute top-0 left-0 right-0 h-px bg-[#15434a]" /> */}

              {/* <div className="flex items-center justify-between px-5 pt-5">
                <div>
                  <p className="font-mono text-[8px] tracking-[0.15em] text-[#52777c]">
                    INVENTORY DISTRIBUTION
                  </p>

                  <p className="text-sm font-medium text-[#cbdcde] mt-1">
                    Category Breakdown
                  </p>
                </div>

                <span className="font-mono text-[7px] tracking-[0.12em] text-[#405f64] border border-[#123a40] rounded-full px-2 py-1">
                  CURRENT
                </span>
              </div> */}

              <div className="px-2 pb-3 pt-3">
                <CategoryBreakdownChart data={categoryBreakdown} />
              </div>
            {/* </div> */}
          </div>
        </section>

        {/* ==================================================
            RECENT ACTIVITY
        ================================================== */}

        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-mono text-[8px] tracking-[0.18em] text-[#f9b223]">
                03 / ACTIVITY
              </p>
            </div>

            <span className="font-mono text-[8px] text-[#405f64]">
              RECENT EVENTS
            </span>
          </div>

          <div
            className="
              relative
              rounded-xl
              border
              border-[#15434a]
              bg-[#061d21]/90
              backdrop-blur-xl
              overflow-hidden
              shadow-[0_15px_40px_rgba(0,0,0,.15)]
            ">
            <RecentActivity items={recentActivity} />
          </div>
        </section>

        {/* ==================================================
            FOOTER SYSTEM STATUS
        ================================================== */}

        <div className="mt-8 pt-5 border-t border-[#123a40] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span className="font-mono text-[7px] tracking-[0.16em] text-[#405f64]">
            STOCKFLOW / INVENTORY INTELLIGENCE
          </span>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-mono text-[7px] text-[#52777c]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#67c987]" />
              API CONNECTED
            </span>

            <span className="flex items-center gap-1.5 font-mono text-[7px] text-[#52777c]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#67c987]" />
              DATA SYNCED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;