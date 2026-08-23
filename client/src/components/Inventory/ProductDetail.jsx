import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Package,
  Activity,
  TrendingUp,
  Tag,
  Clock3,
  BarChart3,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  AlertTriangle,
  Zap,
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import StatusPill from "../common/StatusPill.jsx";

import {
  getProductById,
  getProductStockHistory,
  getProductMovements,
  deleteProduct,
  updateProduct,
} from "../../api/productApi";

import { mapProductToItem } from "../../utils/productTransform";
import FlashSaleSchedule from "./FlashSaleSchedule.jsx";

const movementStyles = {
  sale: {
    bg: "bg-[#f9b223]/10",
    text: "text-[#f9b223]",
    border: "border-[#f9b223]/20",
  },

  restock: {
    bg: "bg-[#66d68b]/10",
    text: "text-[#66d68b]",
    border: "border-[#66d68b]/20",
  },

  adjustment: {
    bg: "bg-[#8aaeb3]/10",
    text: "text-[#8aaeb3]",
    border: "border-[#8aaeb3]/20",
  },
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);

  // Raw product is kept separately for flash sale configuration.
  const [rawProduct, setRawProduct] = useState(null);

  const [history, setHistory] = useState([]);
  const [movements, setMovements] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    unitPrice: "",
    reorderThreshold: "",
    category: "",
    imageUrl: "",
  });
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState(null);

  // Populate the form whenever rawProduct loads/changes
  useEffect(() => {
    if (rawProduct) {
      setEditForm({
        name: rawProduct.name || "",
        unitPrice: rawProduct.unitPrice || "",
        reorderThreshold: rawProduct.reorderThreshold || "",
        category: rawProduct.category || "",
        imageUrl: rawProduct.imageUrl || "",
      });
    }
  }, [rawProduct]);

  async function handleSaveEdit() {
    setSaving(true);
    setEditError(null);

    try {
      const updated = await updateProduct(id, {
        name: editForm.name,
        unitPrice: Number(editForm.unitPrice),
        reorderThreshold: Number(editForm.reorderThreshold),
        category: editForm.category,
        imageUrl: editForm.imageUrl,
      });

      setRawProduct(updated);
      setItem(mapProductToItem(updated));
      setShowEditModal(false);
    } catch (err) {
      console.error(err);
      setEditError("Failed to update product. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [product, stockHistory, recentMovements] = await Promise.all([
          getProductById(id),
          getProductStockHistory(id, 7),
          getProductMovements(id, 10),
        ]);

        setItem(mapProductToItem(product));
        setRawProduct(product);
        setHistory(stockHistory);
        setMovements(recentMovements);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Product not found.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm(`Delete ${item.name}? This cannot be undone.`)) {
      return;
    }

    try {
      setDeleting(true);

      await deleteProduct(id);

      navigate("/inventory");
    } catch (err) {
      console.error(err);

      alert(
        "Failed to delete product. It may be referenced by existing orders.",
      );

      setDeleting(false);
    }
  };

  /* ================================================================
     LOADING
  ================================================================ */

  if (loading) {
    return (
      <div className="relative min-h-[70vh] bg-[#04161a] text-[#f4faf9] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(168,196,200,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(168,196,200,.04)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        <div className="relative text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#f9b223]/10 border border-[#f9b223]/20 flex items-center justify-center mx-auto mb-5">
            <Package size={22} className="text-[#f9b223] animate-pulse" />
          </div>

          <p className="font-mono text-[9px] tracking-[0.18em] text-[#f9b223]">
            STOCKFLOW
          </p>

          <p className="font-mono text-[10px] tracking-[0.14em] text-[#668b90] mt-2">
            LOADING PRODUCT DATA...
          </p>
        </div>
      </div>
    );
  }

  /* ================================================================
     ERROR
  ================================================================ */

  if (error || !item) {
    return (
      <div className="relative min-h-[70vh] bg-[#04161a] text-[#f4faf9] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(168,196,200,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(168,196,200,.04)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        <div className="relative border border-[#15434a] bg-[#061d21]/95 rounded-2xl p-12 text-center max-w-md">
          <div className="w-12 h-12 rounded-xl bg-[#e08484]/10 border border-[#e08484]/20 flex items-center justify-center mx-auto mb-5">
            <AlertTriangle size={20} className="text-[#e08484]" />
          </div>

          <p className="font-mono text-[9px] tracking-[0.16em] text-[#e08484]">
            PRODUCT ERROR
          </p>

          <p className="text-sm text-[#9ab2b5] mt-3">
            {error || "Product not found."}
          </p>

          <button
            onClick={() => navigate("/inventory")}
            className="mt-6 inline-flex items-center gap-2 bg-[#f9b223] text-[#013f46] px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#ffc44e] transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Inventory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#04161a] text-[#f4faf9] overflow-hidden">
      {/* ============================================================
          BACKGROUND
      ============================================================ */}

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(168,196,200,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(168,196,200,.045)_1px,transparent_1px)] bg-[size:40px_40px]" />

        <div className="absolute left-[5%] top-[8%] w-96 h-96 rounded-full bg-[#013f46]/30 blur-[130px]" />

        <div className="absolute right-[5%] top-[18%] w-[28rem] h-[28rem] rounded-full bg-[#f9b223]/[0.025] blur-[140px]" />
      </div>

      {/* ============================================================
          MAIN
      ============================================================ */}

      <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-10 lg:py-14">
        {/* ========================================================
            TOP NAVIGATION
        ======================================================== */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-10">
          <button
            onClick={() => navigate("/inventory")}
            className="group flex items-center gap-2 text-[#78999e] hover:text-[#d8e8e9] transition-colors"
          >
            <ArrowLeft
              size={15}
              className="group-hover:-translate-x-1 transition-transform"
            />

            <span className="font-mono text-[9px] tracking-[0.14em]">
              BACK TO INVENTORY
            </span>
          </button>

          <div className="flex items-center gap-3">
            {/* Edit */}

            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-2 text-[#78999e] border border-[#17444a] bg-[#061d21]/80 px-4 py-2.5 rounded-xl text-sm hover:bg-[#0a292e] hover:text-[#dce8e9] transition-colors"
            >
              <Pencil size={13} />
              Edit
            </button>

            {/* Delete */}

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="group flex items-center gap-2 text-[#e08484] border border-[#653c3c] bg-[#241719]/50 px-4 py-2.5 rounded-xl text-sm hover:bg-[#e08484]/10 transition-colors disabled:opacity-50"
            >
              <Trash2
                size={13}
                className="group-hover:scale-105 transition-transform"
              />

              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>

        {/* ========================================================
            PAGE HEADER
        ======================================================== */}

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-7 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 border border-[#17444a] bg-[#061e22]/75 rounded-full px-3 py-1.5 mb-5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#66d68b] animate-pulse" />

                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#66d68b]" />
              </span>

              <span className="font-mono text-[8px] tracking-[0.16em] text-[#a8c4c8]">
                PRODUCT CONTROL
              </span>
            </div>

            <p className="font-mono text-[9px] tracking-[0.22em] text-[#f9b223] mb-3">
              INVENTORY / PRODUCT
            </p>

            <h1 className="text-4xl lg:text-5xl font-semibold tracking-[-0.04em] text-[#edf5f4]">
              {item.name}
            </h1>

            <p className="font-mono text-[9px] tracking-[0.12em] text-[#668b90] mt-3">
              {item.sku}
              <span className="mx-2 text-[#31575d]">/</span>
              {item.category}
            </p>
          </div>

          <StatusPill status={item.status} />
        </div>

        {/* ========================================================
            PRODUCT OVERVIEW
        ======================================================== */}

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Product image */}

          <div className="relative border border-[#15434a] bg-[#061d21]/95 rounded-2xl overflow-hidden shadow-2xl">
            <div className="relative h-64 lg:h-full min-h-[340px] bg-[#04181c]">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover opacity-85"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#04161a] via-transparent to-transparent" />

              <div className="absolute top-4 left-4">
                <StatusPill status={item.status} />
              </div>

              <div className="absolute bottom-5 left-5">
                <p className="font-mono text-[8px] tracking-[0.16em] text-[#78999e]">
                  PRODUCT IMAGE
                </p>

                <p className="font-mono text-[9px] text-[#dcebea] mt-1">
                  {item.sku}
                </p>
              </div>
            </div>
          </div>

          {/* Metrics */}

          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {/* Current Stock */}

            <MetricCard
              icon={Package}
              label="CURRENT STOCK"
              value={item.stock}
              suffix="UNITS"
              accent="gold"
            />

            {/* Reorder Point */}

            <MetricCard
              icon={RefreshCw}
              label="REORDER POINT"
              value={item.reorderPoint}
              suffix="UNITS"
              accent="neutral"
            />

            {/* Unit Price */}

            <MetricCard
              icon={TrendingUp}
              label="UNIT PRICE"
              value={`₹${item.price}`}
              suffix="PER UNIT"
              accent="gold"
            />

            {/* Category */}

            <MetricCard
              icon={Tag}
              label="CATEGORY"
              value={item.category}
              suffix=""
              accent="neutral"
            />

            {/* Last Updated */}

            <MetricCard
              icon={Clock3}
              label="LAST UPDATED"
              value={item.lastUpdated}
              suffix=""
              accent="neutral"
            />

            {/* Inventory state */}

            <div className="relative border border-[#15434a] bg-[#061d21]/95 rounded-2xl p-5 overflow-hidden">
              <div className="flex items-center gap-2 mb-3">
                <Activity size={13} className="text-[#66d68b]" />

                <p className="font-mono text-[8px] tracking-[0.13em] text-[#668b90]">
                  SYSTEM STATE
                </p>
              </div>

              <p className="text-lg font-semibold text-[#66d68b]">ACTIVE</p>

              <p className="font-mono text-[8px] text-[#54777c] mt-1">
                INVENTORY TRACKING
              </p>

              <div className="absolute bottom-0 left-5 right-5 h-px bg-gradient-to-r from-[#66d68b]/50 to-transparent" />
            </div>
          </div>
        </section>

        {/* ========================================================
            FLASH SALE
        ======================================================== */}

        {rawProduct && (
          <section className="mt-10">
            <SectionHeader
              icon={ZapIcon}
              label="FLASH SALE CONTROL"
              status="CONFIGURATION"
            />

            <div className="mt-5">
              <FlashSaleSchedule
                productId={id}
                flashSale={rawProduct.flashSale}
                currentStock={rawProduct.currentStock}
                onUpdated={(updated) => setRawProduct(updated)}
              />
            </div>
          </section>
        )}

        {/* ========================================================
            STOCK HISTORY
        ======================================================== */}

        <section className="mt-10">
          <SectionHeader
            icon={BarChart3}
            label="STOCK HISTORY"
            status="7 DAYS"
          />

          <div className="relative mt-5 border border-[#15434a] bg-[#061d21]/95 rounded-2xl p-6 lg:p-7 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-[#013f46]/10 via-transparent to-transparent" />

            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="font-mono text-[8px] tracking-[0.15em] text-[#668b90]">
                    INVENTORY MOVEMENT
                  </p>

                  <p className="text-sm text-[#d8e8e9] mt-1">
                    Stock levels over the last 7 days
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f9b223]" />

                  <span className="font-mono text-[8px] text-[#668b90]">
                    STOCK
                  </span>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="detailFill" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="#f9b223"
                        stopOpacity={0.22}
                      />

                      <stop offset="100%" stopColor="#f9b223" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#173d43"
                  />

                  <XAxis
                    dataKey="day"
                    tick={{
                      fontSize: 10,
                      fill: "#668b90",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tick={{
                      fontSize: 10,
                      fill: "#668b90",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    contentStyle={{
                      background: "#061d21",
                      border: "1px solid #17444a",
                      borderRadius: 10,
                      color: "#d8e8e9",
                      fontSize: 12,
                    }}
                    labelStyle={{
                      color: "#668b90",
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="stock"
                    stroke="#f9b223"
                    strokeWidth={2}
                    fill="url(#detailFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* ========================================================
            RECENT MOVEMENTS
        ======================================================== */}

        <section className="mt-10">
          <SectionHeader
            icon={Activity}
            label="RECENT MOVEMENTS"
            status={`${movements.length} EVENTS`}
          />

          <div className="relative mt-5 border border-[#15434a] bg-[#061d21]/95 rounded-2xl overflow-hidden">
            {movements.length === 0 ? (
              <div className="py-16 text-center">
                <Activity size={22} className="mx-auto text-[#54777c] mb-4" />

                <p className="font-mono text-[9px] tracking-[0.15em] text-[#668b90]">
                  NO MOVEMENTS
                </p>

                <p className="text-sm text-[#54777c] mt-2">
                  No movements have been recorded yet.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-[#123a40]">
                {movements.map((m) => {
                  const style =
                    movementStyles[m.type] || movementStyles.adjustment;

                  const isPositive = m.change > 0;

                  return (
                    <li
                      key={m.id}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 hover:bg-[#0a272c]/50 transition-colors"
                    >
                      {/* Left */}

                      <div className="flex items-center gap-4 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${style.bg} ${style.border}`}
                        >
                          {isPositive ? (
                            <ArrowUpRight size={15} className={style.text} />
                          ) : (
                            <ArrowDownRight
                              size={15}
                              className={
                                m.type === "sale"
                                  ? "text-[#f9b223]"
                                  : "text-[#e08484]"
                              }
                            />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-mono text-[8px] tracking-[0.1em] px-2 py-1 rounded-md border capitalize ${style.bg} ${style.text} ${style.border}`}
                            >
                              {m.type}
                            </span>
                          </div>

                          <p className="text-sm text-[#c4d5d6] mt-1.5 truncate">
                            {m.note}
                          </p>
                        </div>
                      </div>

                      {/* Right */}

                      <div className="flex items-center gap-5 sm:shrink-0">
                        <span
                          className={`font-mono text-sm font-semibold ${
                            isPositive ? "text-[#66d68b]" : "text-[#e08484]"
                          }`}
                        >
                          {isPositive ? `+${m.change}` : m.change}
                        </span>

                        <span className="font-mono text-[8px] tracking-[0.08em] text-[#54777c] whitespace-nowrap">
                          {m.time}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        {/* ========================================================
            FOOTER
        ======================================================== */}

        <div className="mt-12 flex items-center gap-4 pb-5">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#19434a] to-transparent" />

          <span className="font-mono text-[8px] tracking-[0.16em] text-[#50757a]">
            STOCKFLOW / PRODUCT / CONTROL
          </span>

          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#19434a] to-transparent" />
        </div>
      </main>

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-[#02090b]/80 backdrop-blur-sm"
            onClick={() => !saving && setShowEditModal(false)}
          />

          <div className="relative w-full max-w-md border border-[#15434a] bg-[#061d21] rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,.4)] overflow-hidden">
            <div className="h-1 bg-[#f9b223]" />

            <div className="p-6 sm:p-8">
              <p className="font-mono text-[8px] tracking-[0.16em] text-[#f9b223] mb-2">
                STOCKFLOW / EDIT PRODUCT
              </p>

              <h2 className="text-xl font-semibold text-[#e7f1f1] mb-6">
                Edit product
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="font-mono text-[8px] tracking-[0.1em] text-[#668b90]">
                    NAME
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className="mt-1.5 w-full bg-[#0a292e] border border-[#17444a] rounded-xl px-4 py-2.5 text-sm text-[#dcebea] outline-none focus:border-[#28606a] transition-colors"
                  />
                </div>

                <div>
                  <label className="font-mono text-[8px] tracking-[0.1em] text-[#668b90]">
                    UNIT PRICE (₹)
                  </label>
                  <input
                    type="number"
                    value={editForm.unitPrice}
                    onChange={(e) =>
                      setEditForm({ ...editForm, unitPrice: e.target.value })
                    }
                    className="mt-1.5 w-full bg-[#0a292e] border border-[#17444a] rounded-xl px-4 py-2.5 text-sm text-[#dcebea] outline-none focus:border-[#28606a] transition-colors"
                  />
                </div>

                <div>
                  <label className="font-mono text-[8px] tracking-[0.1em] text-[#668b90]">
                    REORDER POINT
                  </label>
                  <input
                    type="number"
                    value={editForm.reorderThreshold}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        reorderThreshold: e.target.value,
                      })
                    }
                    className="mt-1.5 w-full bg-[#0a292e] border border-[#17444a] rounded-xl px-4 py-2.5 text-sm text-[#dcebea] outline-none focus:border-[#28606a] transition-colors"
                  />
                </div>

                <div>
                  <label className="font-mono text-[8px] tracking-[0.1em] text-[#668b90]">
                    CATEGORY
                  </label>
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm({ ...editForm, category: e.target.value })
                    }
                    className="mt-1.5 w-full bg-[#0a292e] border border-[#17444a] rounded-xl px-4 py-2.5 text-sm text-[#dcebea] outline-none focus:border-[#28606a] transition-colors"
                  />
                </div>

                <div>
                  <label className="font-mono text-[8px] tracking-[0.1em] text-[#668b90]">
                    IMAGE URL
                  </label>
                  <input
                    type="text"
                    value={editForm.imageUrl}
                    onChange={(e) =>
                      setEditForm({ ...editForm, imageUrl: e.target.value })
                    }
                    placeholder="https://example.com/image.jpg"
                    className="mt-1.5 w-full bg-[#0a292e] border border-[#17444a] rounded-xl px-4 py-2.5 text-sm text-[#dcebea] outline-none focus:border-[#28606a] transition-colors placeholder:text-[#496c71]"
                  />

                  {editForm.imageUrl && (
                    <div className="mt-3 w-16 h-16 rounded-lg overflow-hidden border border-[#17444a] bg-[#0a292e]">
                      <img
                        src={editForm.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => (e.target.style.display = "none")}
                      />
                    </div>
                  )}
                </div>
              </div>

              {editError && (
                <div className="mt-4 border border-[#5b3035] bg-[#24171a] rounded-lg px-4 py-3">
                  <p className="font-mono text-[9px] text-[#e08484]">
                    {editError}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  disabled={saving}
                  className="flex-1 border border-[#1b3c41] text-[#a8c4c8] text-sm font-medium px-5 py-3 rounded-xl hover:bg-[#0a292e] transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="flex-1 bg-[#f9b223] text-[#013f46] text-sm font-semibold px-5 py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saving ? "SAVING..." : "SAVE CHANGES"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ==================================================================
   SMALL COMPONENTS
   ================================================================== */

const MetricCard = ({ icon: Icon, label, value, suffix, accent }) => {
  return (
    <div className="relative border border-[#15434a] bg-[#061d21]/95 rounded-2xl p-5 overflow-hidden group hover:border-[#28606a] transition-colors">
      <div className="flex items-center gap-2 mb-3">
        <Icon
          size={13}
          className={accent === "gold" ? "text-[#f9b223]" : "text-[#668b90]"}
        />

        <p className="font-mono text-[8px] tracking-[0.13em] text-[#668b90]">
          {label}
        </p>
      </div>

      <p
        className={`text-xl font-semibold truncate ${
          accent === "gold" ? "text-[#f9b223]" : "text-[#dcebea]"
        }`}
      >
        {value}
      </p>

      {suffix && (
        <p className="font-mono text-[8px] text-[#54777c] mt-1">{suffix}</p>
      )}

      <div
        className={`absolute bottom-0 left-5 right-5 h-px bg-gradient-to-r ${
          accent === "gold" ? "from-[#f9b223]/40" : "from-[#19434a]"
        } to-transparent`}
      />
    </div>
  );
};

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

const ZapIcon = (props) => <Zap {...props} />;

export default ProductDetail;
