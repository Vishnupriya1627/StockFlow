import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Plus,
  SlidersHorizontal,
  Package,
  Database,
  Filter,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";

import InventoryCard from "./InventoryCard";
import AddProductModal from "./AddProductModal";

import { getAllProducts } from "../../api/productApi";
import { mapProductToItem } from "../../utils/productTransform";
import { categories, statusFilters } from "../../data/mockInventory";

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const products = await getAllProducts();

      setItems(products.map(mapProductToItem));
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load inventory. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesQuery =
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.sku.toLowerCase().includes(query.toLowerCase());

      const matchesCategory =
        category === "All" || item.category === category;

      const matchesStatus =
        status === "All" || item.status === status;

      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [query, category, status, items]);

  const handleProductCreated = (newProduct) => {
    setItems((prev) => [mapProductToItem(newProduct), ...prev]);
  };

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
        <div className="absolute left-[5%] top-[12%] w-96 h-96 rounded-full bg-[#013f46]/40 blur-[130px]" />

        <div className="absolute right-[3%] top-[20%] w-[28rem] h-[28rem] rounded-full bg-[#f9b223]/[0.035] blur-[140px]" />

        <div className="absolute left-[45%] bottom-[10%] w-80 h-80 rounded-full bg-[#013f46]/30 blur-[130px]" />
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
                INVENTORY CONTROL
              </span>
            </div>

            <p className="font-mono text-[10px] tracking-[0.22em] text-[#f9b223] mb-4">
              STOCK MANAGEMENT
            </p>

            <h1 className="text-5xl lg:text-[64px] font-semibold leading-[0.98] tracking-[-0.045em]">
              Inventory
              <br />
              <span className="text-[#78999e]">
                Control.
              </span>
            </h1>

            <p className="text-[#8eafb3] text-sm lg:text-base mt-6 max-w-2xl leading-relaxed">
              Manage products, monitor inventory state, and keep your
              StockFlow catalog ready for live flash-sale traffic.
            </p>
          </div>

          {/* Header right */}

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 border border-[#17444a] bg-[#061e22]/80 rounded-lg px-3 py-2.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#66d68b] animate-pulse" />

                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#66d68b]" />
              </span>

              <span className="font-mono text-[9px] tracking-[0.12em] text-[#83a5aa]">
                {items.length} PRODUCTS
              </span>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="group flex items-center gap-2 bg-[#f9b223] text-[#013f46] text-sm font-semibold px-5 py-3 rounded-xl hover:bg-[#ffc44e] transition-all"
            >
              <Plus
                size={15}
                className="group-hover:rotate-90 transition-transform"
              />

              Add Product
            </button>
          </div>
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
              <Filter
                size={14}
                className="text-[#f9b223]"
              />

              <span className="font-mono text-[9px] tracking-[0.16em] text-[#a8c4c8]">
                INVENTORY FILTERS
              </span>
            </div>

            <span className="font-mono text-[8px] text-[#587b80]">
              {filteredItems.length} MATCHES
            </span>
          </div>

          {/* Filters */}

          <div className="relative p-6 lg:p-7">
            <div className="grid lg:grid-cols-[1fr_auto_auto] gap-4 items-end">

              {/* Search */}

              <div>
                <label className="font-mono text-[9px] tracking-[0.14em] text-[#668b90] block mb-2">
                  SEARCH INVENTORY
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
                    placeholder="Search by name or SKU..."
                    className="w-full text-sm border border-[#17444a] rounded-xl pl-11 pr-4 py-3 outline-none bg-[#04181c] text-[#d8e8e9] placeholder:text-[#54777c] focus:border-[#f9b223]/60 transition-colors"
                  />
                </div>
              </div>

              {/* Category */}

              <div>
                <label className="font-mono text-[9px] tracking-[0.14em] text-[#668b90] block mb-2">
                  CATEGORY
                </label>

                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="appearance-none text-sm border border-[#17444a] rounded-xl px-4 pr-10 py-3 outline-none bg-[#04181c] text-[#d8e8e9] focus:border-[#f9b223]/60 transition-colors"
                  >
                    {categories.map((c) => (
                      <option
                        key={c}
                        value={c}
                        className="bg-[#061d21] text-white"
                      >
                        {c === "All" ? "All Categories" : c}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6e9095]"
                  />
                </div>
              </div>

              {/* Status */}

              <div>
                <label className="font-mono text-[9px] tracking-[0.14em] text-[#668b90] block mb-2">
                  STATUS
                </label>

                <div className="relative">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="appearance-none text-sm border border-[#17444a] rounded-xl px-4 pr-10 py-3 outline-none bg-[#04181c] text-[#d8e8e9] focus:border-[#f9b223]/60 transition-colors"
                  >
                    {statusFilters.map((s) => (
                      <option
                        key={s}
                        value={s}
                        className="bg-[#061d21] text-white"
                      >
                        {s === "All" ? "All Statuses" : s.replace("-", " ")}
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
            INVENTORY HEADER
        ======================================================== */}

        <div className="mt-12 flex items-center gap-4">
          <span className="font-mono text-[9px] tracking-[0.18em] text-[#668b90]">
            PRODUCT INVENTORY
          </span>

          <div className="h-px flex-1 bg-gradient-to-r from-[#19434a] to-transparent" />

          <span className="font-mono text-[8px] text-[#66b47e] flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#66d68b] animate-pulse" />

              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#66d68b]" />
            </span>

            LIVE
          </span>
        </div>

        {/* ========================================================
            LOADING
        ======================================================== */}

        {loading ? (
          <div className="relative mt-5 border border-[#15434a] bg-[#061d21]/95 rounded-2xl p-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#f9b223]/[0.07] border border-[#f9b223]/10 flex items-center justify-center mx-auto mb-5">
              <Package
                size={20}
                className="text-[#f9b223] animate-pulse"
              />
            </div>

            <p className="font-mono text-[9px] tracking-[0.16em] text-[#668b90]">
              INVENTORY STATUS
            </p>

            <p className="text-sm text-[#d5e5e6] mt-2">
              Loading inventory...
            </p>
          </div>
        ) : error ? (
          /* ========================================================
             ERROR
          ======================================================== */

          <div className="mt-5 flex items-start gap-3 border border-[#653c3c] bg-[#241719]/80 rounded-xl px-5 py-4">
            <AlertTriangle
              size={16}
              className="text-[#e08484] mt-0.5 shrink-0"
            />

            <div>
              <p className="font-mono text-[9px] tracking-[0.12em] text-[#e08484]">
                INVENTORY ERROR
              </p>

              <p className="text-sm text-[#b78b8b] mt-1">
                {error}
              </p>
            </div>
          </div>
        ) : filteredItems.length > 0 ? (
          /* ========================================================
             PRODUCT GRID
          ======================================================== */

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-5">
            {filteredItems.map((item) => (
              <InventoryCard
                key={item.id}
                item={item}
              />
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
                <SlidersHorizontal
                  size={24}
                  className="text-[#f9b223]"
                />
              </div>

              <p className="font-mono text-[9px] tracking-[0.18em] text-[#668b90] mb-3">
                INVENTORY STATUS
              </p>

              <p className="text-base font-semibold text-[#dcebea]">
                No products match your filters.
              </p>

              <p className="text-xs text-[#6e9095] mt-2 max-w-md mx-auto leading-relaxed">
                Try changing your search query, category, or inventory
                status to find additional products.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================
            FOOTER
        ======================================================== */}

        <div className="mt-12 flex items-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#19434a] to-transparent" />

          <span className="font-mono text-[8px] tracking-[0.16em] text-[#50757a]">
            STOCKFLOW / INVENTORY / CONTROL
          </span>

          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#19434a] to-transparent" />
        </div>
      </main>

      {/* ============================================================
          MODAL
      ============================================================ */}

      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={handleProductCreated}
      />
    </div>
  );
};

export default Inventory;