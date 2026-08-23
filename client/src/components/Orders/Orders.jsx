import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import {
  Search,
  ArrowUpDown,
  ShoppingBag,
  Database,
  SlidersHorizontal,
  ArrowRight,
} from "lucide-react";

import StatusPill from "../common/StatusPill";

const orderStatusFilters = [
  "All",
  "pending",
  "processing",
  "shipped",
  "delivered",
  "delayed",
  "cancelled",
];

const Orders = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });

  // --------------------------------------------------
  // FETCH REAL ORDERS
  // --------------------------------------------------

  useEffect(() => {
    setLoading(true);
    setError(null);

    api
      .get("/orders")
      .then((res) => {
        setOrders(res.data.orders || []);
      })
      .catch((err) => {
        console.error("Failed to fetch orders:", err);
        setError("Could not load orders.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // --------------------------------------------------
  // FILTER + SORT
  // --------------------------------------------------

  const filteredOrders = useMemo(() => {
    let result = orders.filter((o) => {
      const matchesQuery =
        (o.orderNumber || "").toLowerCase().includes(query.toLowerCase()) ||
        (o.customer?.name || "").toLowerCase().includes(query.toLowerCase());

      const matchesStatus = status === "All" || o.status === status;

      return matchesQuery && matchesStatus;
    });

    const getSortValue = (order, key) => {
      if (key === "date") return new Date(order.createdAt).getTime();
      if (key === "id") return order.orderNumber || "";
      if (key === "customer") return order.customer?.name || "";
      if (key === "items") return order.items?.length || 0;
      if (key === "total") return order.totalAmount || 0;
      return order[key];
    };

    result.sort((a, b) => {
      const dir = sortConfig.direction === "asc" ? 1 : -1;

      const aVal = getSortValue(a, sortConfig.key);
      const bVal = getSortValue(b, sortConfig.key);

      if (aVal < bVal) return -1 * dir;
      if (aVal > bVal) return 1 * dir;

      return 0;
    });

    return result;
  }, [orders, query, status, sortConfig]);

  const SortHeader = ({ label, sortKey }) => (
    <button
      onClick={() => handleSort(sortKey)}
      className="flex items-center gap-2 font-mono text-[8px] tracking-[0.13em] text-[#668b90] hover:text-[#dcebea] transition-colors"
    >
      {label}

      <ArrowUpDown size={11} className="text-[#54777c]" />
    </button>
  );

  return (
    <div className="relative min-h-screen bg-[#04161a] text-[#f4faf9] overflow-hidden">
      <Background />

      <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-10 lg:py-14">
        {/* ============================================================
            HEADER
        ============================================================ */}

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-7 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 border border-[#17444a] bg-[#061e22]/75 rounded-full px-3 py-1.5 mb-5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#66d68b] animate-pulse" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#66d68b]" />
              </span>

              <span className="font-mono text-[8px] tracking-[0.16em] text-[#a8c4c8]">
                ORDER MANAGEMENT
              </span>
            </div>

            <p className="font-mono text-[9px] tracking-[0.22em] text-[#f9b223] mb-3">
              STOCKFLOW / ORDERS
            </p>

            <h1 className="text-4xl lg:text-5xl font-semibold tracking-[-0.04em] text-[#edf5f4]">
              Orders
            </h1>

            <p className="font-mono text-[9px] tracking-[0.1em] text-[#668b90] mt-4">
              {filteredOrders.length} OF {orders.length} ORDERS
            </p>
          </div>

          <button
            disabled
            title="Coming soon — will connect once backend is ready"
            className="flex items-center justify-center gap-2 border border-[#1b3c41] bg-[#0a2428] text-[#496c71] text-[10px] font-mono tracking-[0.08em] px-5 py-3 rounded-xl cursor-not-allowed"
          >
            <ShoppingBag size={14} />
            CREATE ORDER
            <span className="text-[7px] border border-[#31575d] rounded px-1.5 py-0.5 ml-1">
              SOON
            </span>
          </button>
        </div>

        {/* ============================================================
            FILTER BAR
        ============================================================ */}

        <section>
          <SectionHeader
            icon={SlidersHorizontal}
            label="ORDER FILTERS"
            status="QUERY / STATUS"
          />

          <div className="mt-5 border border-[#15434a] bg-[#061d21]/95 rounded-2xl p-4">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="flex items-center gap-3 bg-[#0a292e] border border-[#17444a] rounded-xl px-4 py-3 flex-1 focus-within:border-[#28606a] transition-colors">
                <Search size={15} className="text-[#54777c] shrink-0" />

                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by order number or client ID..."
                  className="bg-transparent outline-none text-sm text-[#dcebea] w-full placeholder:text-[#496c71]"
                />
              </div>

              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="appearance-none w-full lg:w-52 bg-[#0a292e] border border-[#17444a] rounded-xl px-4 py-3 pr-10 outline-none text-[10px] font-mono tracking-[0.05em] text-[#a8c4c8] cursor-pointer hover:border-[#28606a] transition-colors"
                >
                  {orderStatusFilters.map((s) => (
                    <option
                      key={s}
                      value={s}
                      className="bg-[#061d21] text-[#dcebea]"
                    >
                      {s === "All" ? "ALL STATUSES" : s.toUpperCase()}
                    </option>
                  ))}
                </select>

                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#54777c]">
                  <SlidersHorizontal size={12} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            ORDERS TABLE
        ============================================================ */}

        <section className="mt-10">
          <SectionHeader
            icon={Database}
            label="ORDER REGISTRY"
            status={`${filteredOrders.length} RECORDS`}
          />

          <div className="mt-5 border border-[#15434a] bg-[#061d21]/95 rounded-2xl overflow-hidden">
            {loading ? (
              /* ======================================================
                 LOADING STATE
              ====================================================== */
              <div className="py-20 px-6 text-center">
                <p className="font-mono text-[9px] tracking-[0.14em] text-[#668b90]">
                  LOADING ORDERS...
                </p>
              </div>
            ) : error ? (
              /* ======================================================
                 ERROR STATE
              ====================================================== */
              <div className="py-20 px-6 text-center">
                <p className="font-mono text-[9px] tracking-[0.14em] text-[#e08484]">
                  {error}
                </p>
              </div>
            ) : filteredOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px]">
                  {/* ==================================================
                      TABLE HEADER
                  ================================================== */}

                  <thead>
                    <tr className="border-b border-[#17444a] bg-[#071f23]">
                      <th className="text-left px-6 py-4">
                        <SortHeader label="ORDER ID" sortKey="id" />
                      </th>

                      <th className="text-left px-6 py-4">
                        <SortHeader label="CUSTOMER" sortKey="customer" />
                      </th>

                      <th className="text-left px-6 py-4">
                        <SortHeader label="ITEMS" sortKey="items" />
                      </th>

                      <th className="text-left px-6 py-4">
                        <SortHeader label="TOTAL" sortKey="total" />
                      </th>

                      <th className="text-left px-6 py-4">
                        <SortHeader label="STATUS" sortKey="status" />
                      </th>

                      <th className="text-left px-6 py-4">
                        <SortHeader label="DATE" sortKey="date" />
                      </th>

                      <th className="px-6 py-4" />
                    </tr>
                  </thead>

                  {/* ==================================================
                      TABLE BODY
                  ================================================== */}

                  <tbody className="divide-y divide-[#123a40]">
                    {filteredOrders.map((order, index) => (
                      <tr
                        key={order._id}
                        onClick={() => navigate(`/orders/${order._id}`)}
                        className="group cursor-pointer hover:bg-[#0a292e]/55 transition-colors"
                      >
                        {/* Order ID */}

                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#0a292e] border border-[#17444a] flex items-center justify-center group-hover:border-[#28606a] transition-colors">
                              <ShoppingBag
                                size={14}
                                className="text-[#78999e] group-hover:text-[#f9b223] transition-colors"
                              />
                            </div>

                            <div>
                              <p className="text-sm font-medium text-[#dcebea] group-hover:text-white transition-colors">
                                {order.orderNumber}
                              </p>

                              <p className="font-mono text-[7px] tracking-[0.1em] text-[#496c71] mt-1">
                                ORDER {String(index + 1).padStart(3, "0")}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Client */}

                        <td className="px-6 py-5">
                          <p className="text-sm text-[#a8c4c8]">
                             {order.customer?.name || "—"}{" "}
                          </p>
                        </td>

                        {/* Items */}

                        <td className="px-6 py-5">
                          <span className="inline-flex items-center justify-center min-w-8 h-7 px-2 rounded-lg bg-[#0a292e] border border-[#17444a] font-mono text-[9px] text-[#78999e]">
                            {order.items?.length || 0}
                          </span>
                        </td>

                        {/* Total */}

                        <td className="px-6 py-5">
                          <p className="text-sm font-semibold text-[#dcebea]">
                            ₹{(order.totalAmount || 0).toLocaleString("en-IN")}
                          </p>
                        </td>

                        {/* Status */}

                        <td className="px-6 py-5">
                          <StatusPill status={order.status} />
                        </td>

                        {/* Date */}

                        <td className="px-6 py-5">
                          <p className="font-mono text-[9px] text-[#78999e] whitespace-nowrap">
                            {new Date(order.createdAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </td>

                        {/* Arrow */}

                        <td className="px-6 py-5">
                          <div className="w-8 h-8 rounded-lg border border-transparent group-hover:border-[#17444a] group-hover:bg-[#0a292e] flex items-center justify-center transition-all">
                            <ArrowRight
                              size={14}
                              className="text-[#496c71] group-hover:text-[#f9b223] group-hover:translate-x-0.5 transition-all"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* ======================================================
                 EMPTY STATE
              ====================================================== */
              <div className="py-20 px-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#0a292e] border border-[#17444a] flex items-center justify-center mx-auto mb-5">
                  <Search size={20} className="text-[#54777c]" />
                </div>

                <p className="font-mono text-[9px] tracking-[0.14em] text-[#668b90]">
                  NO ORDERS FOUND
                </p>

                <p className="text-sm text-[#54777c] mt-2">
                  No orders match your current filters.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ============================================================
            FOOTER
        ============================================================ */}

        <div className="mt-12 flex items-center gap-4 pb-5">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#19434a] to-transparent" />

          <span className="font-mono text-[8px] tracking-[0.16em] text-[#50757a]">
            STOCKFLOW / ORDERS / REGISTRY
          </span>

          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#19434a] to-transparent" />
        </div>
      </main>
    </div>
  );
};

/* ==================================================================
   BACKGROUND
   ================================================================== */

const Background = () => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(168,196,200,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(168,196,200,.045)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="absolute left-[5%] top-[8%] w-96 h-96 rounded-full bg-[#013f46]/30 blur-[130px]" />

      <div className="absolute right-[5%] top-[18%] w-[28rem] h-[28rem] rounded-full bg-[#f9b223]/[0.025] blur-[140px]" />
    </div>
  );
};

/* ==================================================================
   SECTION HEADER
   ================================================================== */

const SectionHeader = ({ icon: Icon, label, status }) => {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Icon size={13} className="text-[#f9b223]" />

        <span className="font-mono text-[9px] tracking-[0.18em] text-[#668b90]">
          {label}
        </span>
      </div>

      <div className="h-px flex-1 bg-gradient-to-r from-[#19434a] to-transparent" />

      {status && (
        <span className="font-mono text-[8px] tracking-[0.1em] text-[#54777c]">
          {status}
        </span>
      )}
    </div>
  );
};

export default Orders;
