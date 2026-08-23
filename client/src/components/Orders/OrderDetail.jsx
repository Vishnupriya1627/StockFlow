import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Circle,
  Mail,
  Phone,
  MapPin,
  Package,
  User,
  Clock3,
  Receipt,
  Activity,
  ShoppingBag,
} from "lucide-react";

import StatusPill from "../common/StatusPill";
import { getOrderById } from "../../api/ordersApi";
import { formatDate, buildTimeline } from "../../utils/Ordertransform";
import { updateOrderStatus } from "../../api/ordersApi";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);

        const data = await getOrderById(id);

        setOrder(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Order not found.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  async function handleStatusChange(newStatus) {
    setUpdating(true);
    setUpdateError(null);

    try {
      const updatedOrder = await updateOrderStatus(order._id, newStatus);
      setOrder(updatedOrder);
    } catch (err) {
      console.error(err);
      setUpdateError("Failed to update status. Please try again.");
    } finally {
      setUpdating(false);
    }
  }

  /* ================================================================
     LOADING
  ================================================================ */

  if (loading) {
    return (
      <div className="relative min-h-[70vh] bg-[#04161a] text-[#f4faf9] flex items-center justify-center overflow-hidden">
        <Background />

        <div className="relative text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#f9b223]/10 border border-[#f9b223]/20 flex items-center justify-center mx-auto mb-5">
            <Receipt size={22} className="text-[#f9b223] animate-pulse" />
          </div>

          <p className="font-mono text-[9px] tracking-[0.18em] text-[#f9b223]">
            STOCKFLOW
          </p>

          <p className="font-mono text-[10px] tracking-[0.14em] text-[#668b90] mt-2">
            LOADING ORDER DATA...
          </p>
        </div>
      </div>
    );
  }

  /* ================================================================
     ERROR
  ================================================================ */

  if (error || !order) {
    return (
      <div className="relative min-h-[70vh] bg-[#04161a] text-[#f4faf9] flex items-center justify-center overflow-hidden">
        <Background />

        <div className="relative border border-[#15434a] bg-[#061d21]/95 rounded-2xl p-12 text-center max-w-md">
          <div className="w-12 h-12 rounded-xl bg-[#e08484]/10 border border-[#e08484]/20 flex items-center justify-center mx-auto mb-5">
            <Receipt size={20} className="text-[#e08484]" />
          </div>

          <p className="font-mono text-[9px] tracking-[0.16em] text-[#e08484]">
            ORDER ERROR
          </p>

          <p className="text-sm text-[#9ab2b5] mt-3">
            {error || "Order not found."}
          </p>

          <button
            onClick={() => navigate("/orders")}
            className="mt-6 inline-flex items-center gap-2 bg-[#f9b223] text-[#013f46] px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#ffc44e] transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const nextActions = {
    pending: [
      { label: "Mark as Processing", status: "processing", tone: "primary" },
      { label: "Cancel Order", status: "cancelled", tone: "danger" },
    ],
    processing: [
      { label: "Mark as Shipped", status: "shipped", tone: "primary" },
      { label: "Cancel Order", status: "cancelled", tone: "danger" },
    ],
    shipped: [
      { label: "Mark as Delivered", status: "delivered", tone: "primary" },
      { label: "Mark as Delayed", status: "delayed", tone: "warning" },
    ],
    delayed: [
      { label: "Mark as Shipped", status: "shipped", tone: "primary" },
      { label: "Mark as Delivered", status: "delivered", tone: "primary" },
    ],
    confirmed: [],
    delivered: [],
    cancelled: [],
  };

  const actionsForCurrentStatus = nextActions[order.status] || [];

  const items = order.items;
  const timeline = buildTimeline(order);
  const customer = order.customer;

  return (
    <div className="relative min-h-screen bg-[#04161a] text-[#f4faf9] overflow-hidden">
      <Background />

      <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-10 lg:py-14">
        {/* ============================================================
            TOP NAVIGATION
        ============================================================ */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-10">
          <button
            onClick={() => navigate("/orders")}
            className="group flex items-center gap-2 text-[#78999e] hover:text-[#d8e8e9] transition-colors"
          >
            <ArrowLeft
              size={15}
              className="group-hover:-translate-x-1 transition-transform"
            />

            <span className="font-mono text-[9px] tracking-[0.14em]">
              BACK TO ORDERS
            </span>
          </button>

          <StatusPill status={order.status} />
        </div>

        {/* ============================================================
            PAGE HEADER
        ============================================================ */}

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-7 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 border border-[#17444a] bg-[#061e22]/75 rounded-full px-3 py-1.5 mb-5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#66d68b] animate-pulse" />

                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#66d68b]" />
              </span>

              <span className="font-mono text-[8px] tracking-[0.16em] text-[#a8c4c8]">
                ORDER CONTROL
              </span>
            </div>

            <p className="font-mono text-[9px] tracking-[0.22em] text-[#f9b223] mb-3">
              ORDERS / DETAIL
            </p>

            <h1 className="text-4xl lg:text-5xl font-semibold tracking-[-0.04em] text-[#edf5f4]">
              {order.orderNumber}
            </h1>

            <div className="flex flex-wrap items-center gap-3 mt-4">
              <span className="font-mono text-[9px] tracking-[0.1em] text-[#668b90]">
                CREATED
              </span>

              <span className="text-[#31575d]">/</span>

              <span className="font-mono text-[9px] text-[#78999e]">
                {formatDate(order.createdAt)}
              </span>

              <span className="text-[#31575d]">/</span>

              <span className="font-mono text-[9px] text-[#78999e]">
                {items.length} ITEM{items.length !== 1 ? "S" : ""}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="border border-[#15434a] bg-[#061d21]/90 rounded-xl px-4 py-3">
              <p className="font-mono text-[8px] tracking-[0.12em] text-[#668b90]">
                ORDER TOTAL
              </p>

              <p className="text-xl font-semibold text-[#f9b223] mt-1">
                ₹{order.totalAmount.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>

        {/* ============================================================
            MAIN CONTENT
        ============================================================ */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* ========================================================
              LEFT COLUMN
          ======================================================== */}

          <div className="lg:col-span-2 space-y-8">
            {/* ======================================================
                ORDER ITEMS
            ====================================================== */}

            <section>
              <SectionHeader
                icon={ShoppingBag}
                label="ORDER ITEMS"
                status={`${items.length} PRODUCTS`}
              />

              <div className="relative mt-5 border border-[#15434a] bg-[#061d21]/95 rounded-2xl overflow-hidden">
                {/* Header */}

                <div className="px-6 py-4 border-b border-[#123a40] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package size={13} className="text-[#668b90]" />

                    <span className="font-mono text-[8px] tracking-[0.13em] text-[#668b90]">
                      PRODUCT
                    </span>
                  </div>

                  <span className="font-mono text-[8px] tracking-[0.13em] text-[#668b90]">
                    AMOUNT
                  </span>
                </div>

                {/* Items */}

                <ul className="divide-y divide-[#123a40]">
                  {items.map((item, idx) => (
                    <li
                      key={item.product?._id || idx}
                      className="group flex items-center justify-between gap-5 px-6 py-5 hover:bg-[#0a272c]/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        {/* Product icon */}

                        <div className="w-10 h-10 rounded-xl bg-[#0a292e] border border-[#17444a] flex items-center justify-center shrink-0 group-hover:border-[#28606a] transition-colors">
                          <Package size={16} className="text-[#78999e]" />
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#dcebea] truncate">
                            {item.product?.name || "Deleted product"}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="font-mono text-[8px] text-[#54777c]">
                              {item.product?.sku || "—"}
                            </span>

                            <span className="text-[#31575d]">·</span>

                            <span className="font-mono text-[8px] text-[#668b90]">
                              QTY {item.quantity}
                            </span>

                            <span className="text-[#31575d]">·</span>

                            <span className="font-mono text-[8px] text-[#668b90]">
                              ₹{item.unitPrice.toLocaleString("en-IN")} / UNIT
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm font-semibold text-[#dcebea] whitespace-nowrap">
                        ₹
                        {(item.quantity * item.unitPrice).toLocaleString(
                          "en-IN",
                        )}
                      </p>
                    </li>
                  ))}
                </ul>

                {/* Total */}

                <div className="px-6 py-5 border-t border-[#19434a] bg-[#071f23]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-[8px] tracking-[0.14em] text-[#668b90]">
                        ORDER TOTAL
                      </p>

                      <p className="font-mono text-[8px] text-[#54777c] mt-1">
                        {items.length} LINE ITEM
                        {items.length !== 1 ? "S" : ""}
                      </p>
                    </div>

                    <p className="text-2xl font-semibold text-[#f9b223]">
                      ₹{order.totalAmount.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {actionsForCurrentStatus.length > 0 && (
              <section>
                <SectionHeader
                  icon={Activity}
                  label="UPDATE STATUS"
                  status="ORDER ACTIONS"
                />

                <div className="mt-5 border border-[#15434a] bg-[#061d21]/95 rounded-2xl p-6">
                  <p className="text-sm text-[#a8c4c8] mb-5">
                    Current status:{" "}
                    <span className="font-semibold text-[#dcebea] capitalize">
                      {order.status}
                    </span>
                  </p>

                  <div className="flex flex-wrap gap-3">
                    {actionsForCurrentStatus.map((action) => (
                      <button
                        key={action.status}
                        onClick={() => handleStatusChange(action.status)}
                        disabled={updating}
                        className={`
              px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-50 disabled:cursor-not-allowed
              ${
                action.tone === "danger"
                  ? "bg-[#e08484]/10 border border-[#e08484]/30 text-[#e08484] hover:bg-[#e08484]/20"
                  : action.tone === "warning"
                    ? "bg-[#f9b223]/10 border border-[#f9b223]/30 text-[#f9b223] hover:bg-[#f9b223]/20"
                    : "bg-[#f9b223] text-[#013f46] hover:opacity-90"
              }
            `}
                      >
                        {updating ? "UPDATING..." : action.label}
                      </button>
                    ))}
                  </div>

                  {updateError && (
                    <div className="mt-4 border border-[#5b3035] bg-[#24171a] rounded-lg px-4 py-3">
                      <p className="font-mono text-[9px] text-[#e08484]">
                        {updateError}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ======================================================
                ORDER TIMELINE
            ====================================================== */}

            <section>
              <SectionHeader
                icon={Clock3}
                label="ORDER TIMELINE"
                status="EVENT HISTORY"
              />

              <div className="relative mt-5 border border-[#15434a] bg-[#061d21]/95 rounded-2xl p-6 lg:p-7">
                <ul className="space-y-0">
                  {timeline.map((step, idx) => (
                    <li key={step.id} className="flex items-start gap-4">
                      {/* Timeline rail */}

                      <div className="flex flex-col items-center shrink-0">
                        <div
                          className={`w-8 h-8 rounded-xl border flex items-center justify-center ${
                            step.done
                              ? "bg-[#f9b223]/10 border-[#f9b223]/30 text-[#f9b223]"
                              : "bg-[#0a292e] border-[#17444a] text-[#54777c]"
                          }`}
                        >
                          {step.done ? (
                            <Check size={14} />
                          ) : (
                            <Circle size={8} fill="currentColor" />
                          )}
                        </div>

                        {idx < timeline.length - 1 && (
                          <div
                            className={`w-px h-12 mt-1 ${
                              step.done ? "bg-[#f9b223]/20" : "bg-[#173d43]"
                            }`}
                          />
                        )}
                      </div>

                      {/* Event */}

                      <div className="pt-1 pb-8">
                        <p
                          className={`text-sm font-medium ${
                            step.done ? "text-[#dcebea]" : "text-[#54777c]"
                          }`}
                        >
                          {step.label}
                        </p>

                        <p className="font-mono text-[8px] tracking-[0.08em] text-[#54777c] mt-2">
                          {step.time}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>

          {/* ========================================================
              RIGHT COLUMN
          ======================================================== */}

          <div className="space-y-5">
            {/* ======================================================
                CUSTOMER
            ====================================================== */}

            <section>
              <SectionHeader icon={User} label="CUSTOMER" status="CONTACT" />

              <div className="relative mt-5 border border-[#15434a] bg-[#061d21]/95 rounded-2xl p-6 overflow-hidden">
                {customer?.name ? (
                  <>
                    {/* Customer identity */}

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#0a292e] border border-[#17444a] flex items-center justify-center">
                        <User size={19} className="text-[#f9b223]" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#dcebea] truncate">
                          {customer.name}
                        </p>

                        <p className="font-mono text-[8px] tracking-[0.1em] text-[#54777c] mt-1">
                          ORDER CUSTOMER
                        </p>
                      </div>
                    </div>

                    {/* Contact information */}

                    <div className="mt-6 pt-5 border-t border-[#123a40] space-y-4">
                      {customer.email && (
                        <ContactRow
                          icon={Mail}
                          label="EMAIL"
                          value={customer.email}
                        />
                      )}

                      {customer.phone && (
                        <ContactRow
                          icon={Phone}
                          label="PHONE"
                          value={customer.phone}
                        />
                      )}

                      {customer.address && (
                        <ContactRow
                          icon={MapPin}
                          label="ADDRESS"
                          value={customer.address}
                          multiline
                        />
                      )}
                    </div>

                    {/* Buyer session reference */}

                    <div className="mt-6 pt-5 border-t border-[#123a40]">
                      <p className="font-mono text-[7px] tracking-[0.13em] text-[#54777c] mb-1.5">
                        BUYER SESSION
                      </p>

                      <p className="font-mono text-[10px] text-[#668b90] truncate">
                        {order.buyerClientId || "—"}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="py-8 text-center">
                    <User size={22} className="mx-auto text-[#54777c] mb-4" />

                    <p className="font-mono text-[8px] tracking-[0.14em] text-[#668b90]">
                      NO CUSTOMER DATA
                    </p>

                    <p className="text-sm text-[#54777c] mt-2">
                      No customer info on this order.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* ======================================================
                ORDER SUMMARY
            ====================================================== */}

            <div className="border border-[#15434a] bg-[#061d21]/95 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <Receipt size={14} className="text-[#f9b223]" />

                <p className="font-mono text-[8px] tracking-[0.15em] text-[#668b90]">
                  ORDER SUMMARY
                </p>
              </div>

              <div className="space-y-4">
                <SummaryRow label="ORDER ID" value={order.orderNumber} />

                <SummaryRow label="ITEMS" value={items.length} />

                <SummaryRow label="STATUS" value={order.status} capitalize />

                <SummaryRow
                  label="CREATED"
                  value={formatDate(order.createdAt)}
                />
              </div>

              <div className="mt-5 pt-5 border-t border-[#123a40]">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[8px] tracking-[0.12em] text-[#668b90]">
                    TOTAL
                  </span>

                  <span className="text-lg font-semibold text-[#f9b223]">
                    ₹{order.totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* ======================================================
                SYSTEM STATUS
            ====================================================== */}

            <div className="relative border border-[#15434a] bg-[#061d21]/95 rounded-2xl p-6 overflow-hidden">
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-[#66d68b]" />

                <span className="font-mono text-[8px] tracking-[0.14em] text-[#668b90]">
                  ORDER SYSTEM
                </span>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#66d68b] animate-ping opacity-50" />

                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#66d68b]" />
                </span>

                <span className="font-mono text-[9px] text-[#66d68b]">
                  TRACKING ACTIVE
                </span>
              </div>

              <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-[#66d68b]/40 to-transparent" />
            </div>
          </div>
        </div>

        {/* ============================================================
            FOOTER
        ============================================================ */}

        <div className="mt-12 flex items-center gap-4 pb-5">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#19434a] to-transparent" />

          <span className="font-mono text-[8px] tracking-[0.16em] text-[#50757a]">
            STOCKFLOW / ORDERS / CONTROL
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

/* ==================================================================
   CONTACT ROW
   ================================================================== */

const ContactRow = ({ icon: Icon, label, value, multiline = false }) => {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-[#0a292e] border border-[#17444a] flex items-center justify-center shrink-0">
        <Icon size={13} className="text-[#78999e]" />
      </div>

      <div className="min-w-0">
        <p className="font-mono text-[7px] tracking-[0.13em] text-[#54777c]">
          {label}
        </p>

        <p
          className={`text-sm text-[#c4d5d6] mt-1 ${
            multiline ? "leading-5" : "truncate"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
};

/* ==================================================================
   SUMMARY ROW
   ================================================================== */

const SummaryRow = ({ label, value, capitalize = false }) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="font-mono text-[8px] tracking-[0.1em] text-[#54777c]">
        {label}
      </span>

      <span
        className={`font-mono text-[9px] text-[#a8c4c8] text-right ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
};

export default OrderDetail;
