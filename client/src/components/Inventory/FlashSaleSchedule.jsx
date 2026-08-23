import React, { useState } from "react";
import {
  Zap,
  Clock3,
  Package,
  Save,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import { updateProduct } from "../../api/productApi";

// datetime-local inputs need "YYYY-MM-DDTHH:mm" in LOCAL time,
// while the backend stores/expects ISO UTC strings.
function isoToLocalInputValue(iso) {
  if (!iso) return "";

  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const statusStyles = {
  scheduled: {
    text: "text-[#f9b223]",
    bg: "bg-[#f9b223]/10",
    border: "border-[#f9b223]/20",
  },
  live: {
    text: "text-[#66d68b]",
    bg: "bg-[#66d68b]/10",
    border: "border-[#66d68b]/20",
  },
  ended: {
    text: "text-[#78999e]",
    bg: "bg-[#78999e]/10",
    border: "border-[#78999e]/20",
  },
  sold_out: {
    text: "text-[#e08484]",
    bg: "bg-[#e08484]/10",
    border: "border-[#e08484]/20",
  },
};

const FlashSaleSchedule = ({
  productId,
  flashSale,
  currentStock,
  onUpdated,
}) => {
  const [isEnabled, setIsEnabled] = useState(
    flashSale?.isEnabled ?? false
  );

  const [startTime, setStartTime] = useState(
    isoToLocalInputValue(flashSale?.startTime)
  );

  const [endTime, setEndTime] = useState(
    isoToLocalInputValue(flashSale?.endTime)
  );

  const [allocatedStock, setAllocatedStock] = useState(
    flashSale?.allocatedStock ?? ""
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const currentStatus = flashSale?.status;

  async function handleSubmit(e) {
    e.preventDefault();

    setError(null);
    setSuccess(false);

    if (isEnabled) {
      if (!startTime || !endTime) {
        setError("Start and end time are both required.");
        return;
      }

      if (new Date(endTime) <= new Date(startTime)) {
        setError("End time must be after start time.");
        return;
      }

      if (!allocatedStock || Number(allocatedStock) <= 0) {
        setError("Allocated stock must be a positive number.");
        return;
      }

      if (Number(allocatedStock) > currentStock) {
        setError(
          `Allocated stock can't exceed current stock (${currentStock}).`
        );
        return;
      }
    }

    setSaving(true);

    try {
      const updated = await updateProduct(productId, {
        flashSale: {
          isEnabled,
          startTime: isEnabled
            ? new Date(startTime).toISOString()
            : flashSale?.startTime,
          endTime: isEnabled
            ? new Date(endTime).toISOString()
            : flashSale?.endTime,
          allocatedStock: isEnabled
            ? Number(allocatedStock)
            : flashSale?.allocatedStock,
          status: "scheduled",
        },
      });

      setSuccess(true);
      onUpdated?.(updated);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to save flash sale settings."
      );
    } finally {
      setSaving(false);
    }
  }

  const currentStatusStyle =
    statusStyles[currentStatus] || {
      text: "text-[#78999e]",
      bg: "bg-[#78999e]/10",
      border: "border-[#78999e]/20",
    };

  const inputClass =
    "w-full text-sm border border-[#17444a] rounded-xl px-4 py-3 outline-none bg-[#04181c] text-[#d8e8e9] focus:border-[#f9b223]/60 transition-colors";

  const labelClass =
    "font-mono text-[9px] tracking-[0.14em] text-[#668b90] block mb-2";

  return (
    <div className="relative border border-[#15434a] bg-[#061d21]/95 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl">
      {/* Subtle card glow */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-[#013f46]/10 via-transparent to-[#f9b223]/[0.015]" />

      {/* ============================================================
          HEADER
      ============================================================ */}

      <div className="relative px-6 lg:px-7 py-4 border-b border-[#123a40] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap
            size={14}
            className="text-[#f9b223]"
          />

          <span className="font-mono text-[9px] tracking-[0.16em] text-[#a8c4c8]">
            FLASH SALE
          </span>
        </div>

        {currentStatus && (
          <span
            className={`flex items-center gap-1.5 font-mono text-[8px] tracking-[0.1em] px-2.5 py-1.5 rounded-md border capitalize ${currentStatusStyle.bg} ${currentStatusStyle.border} ${currentStatusStyle.text}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                currentStatus === "live"
                  ? "bg-[#66d68b] animate-pulse"
                  : currentStatus === "scheduled"
                  ? "bg-[#f9b223]"
                  : currentStatus === "sold_out"
                  ? "bg-[#e08484]"
                  : "bg-[#78999e]"
              }`}
            />

            {currentStatus.replace("_", " ")}
          </span>
        )}
      </div>

      {/* ============================================================
          FORM
      ============================================================ */}

      <form
        onSubmit={handleSubmit}
        className="relative p-6 lg:p-7"
      >
        {/* Enable toggle */}

        <div className="flex items-center justify-between gap-4 border border-[#17444a] bg-[#04181c] rounded-xl px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                isEnabled
                  ? "bg-[#f9b223]/10 text-[#f9b223]"
                  : "bg-[#0c3035] text-[#668b90]"
              }`}
            >
              <Zap size={16} />
            </div>

            <div>
              <p className="font-mono text-[9px] tracking-[0.12em] text-[#a8c4c8]">
                SALE STATUS
              </p>

              <p className="text-sm text-[#d8e8e9] mt-0.5">
                {isEnabled
                  ? "Flash sale enabled"
                  : "Flash sale disabled"}
              </p>
            </div>
          </div>

          {/* Custom toggle */}

          <button
            type="button"
            onClick={() => setIsEnabled((prev) => !prev)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              isEnabled
                ? "bg-[#f9b223]"
                : "bg-[#17444a]"
            }`}
            aria-label="Toggle flash sale"
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-[#061d21] transition-transform ${
                isEnabled
                  ? "translate-x-6"
                  : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* ========================================================
            SALE CONFIGURATION
        ======================================================== */}

        {isEnabled && (
          <div className="mt-7">
            <div className="flex items-center gap-4 mb-5">
              <span className="font-mono text-[9px] tracking-[0.18em] text-[#668b90]">
                SALE CONFIGURATION
              </span>

              <div className="h-px flex-1 bg-gradient-to-r from-[#19434a] to-transparent" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Start Time */}

              <div>
                <label className={labelClass}>
                  START TIME
                </label>

                <div className="relative">
                  <Clock3
                    size={14}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#668b90] pointer-events-none"
                  />

                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) =>
                      setStartTime(e.target.value)
                    }
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>

              {/* End Time */}

              <div>
                <label className={labelClass}>
                  END TIME
                </label>

                <div className="relative">
                  <Clock3
                    size={14}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#668b90] pointer-events-none"
                  />

                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) =>
                      setEndTime(e.target.value)
                    }
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>

              {/* Allocated Stock */}

              <div className="sm:col-span-2">
                <label className={labelClass}>
                  ALLOCATED STOCK
                </label>

                <div className="relative">
                  <Package
                    size={14}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#668b90] pointer-events-none"
                  />

                  <input
                    type="number"
                    min="1"
                    max={currentStock}
                    value={allocatedStock}
                    onChange={(e) =>
                      setAllocatedStock(e.target.value)
                    }
                    className={`${inputClass} pl-10 pr-32`}
                  />

                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-[8px] text-[#587b80]">
                    / {currentStock} AVAILABLE
                  </span>
                </div>

                {/* Stock indicator */}

                <div className="mt-3 flex items-center justify-between">
                  <span className="font-mono text-[8px] tracking-[0.1em] text-[#54777c]">
                    INVENTORY ALLOCATION
                  </span>

                  <span className="font-mono text-[8px] text-[#83a5aa]">
                    {allocatedStock || 0} / {currentStock}
                  </span>
                </div>

                <div className="mt-1.5 h-1 rounded-full bg-[#0c3035] overflow-hidden">
                  <div
                    className="h-full bg-[#f9b223] rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        currentStock
                          ? (Number(allocatedStock || 0) /
                              currentStock) *
                              100
                          : 0
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            ERROR
        ======================================================== */}

        {error && (
          <div className="mt-5 flex items-start gap-3 border border-[#653c3c] bg-[#241719]/80 rounded-xl px-4 py-3">
            <AlertTriangle
              size={16}
              className="text-[#e08484] mt-0.5 shrink-0"
            />

            <div>
              <p className="font-mono text-[9px] tracking-[0.12em] text-[#e08484]">
                FLASH SALE ERROR
              </p>

              <p className="text-sm text-[#b78b8b] mt-1">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* ========================================================
            SUCCESS
        ======================================================== */}

        {success && (
          <div className="mt-5 flex items-center gap-3 border border-[#286247] bg-[#66d68b]/[0.035] rounded-xl px-4 py-3">
            <CheckCircle2
              size={16}
              className="text-[#66d68b] shrink-0"
            />

            <div>
              <p className="font-mono text-[9px] tracking-[0.12em] text-[#66d68b]">
                CONFIGURATION SAVED
              </p>

              <p className="text-xs text-[#87aaa0] mt-1">
                Flash sale settings have been updated successfully.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================
            FOOTER / ACTION
        ======================================================== */}

        <div className="mt-7 pt-5 border-t border-[#123a40] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[8px] tracking-[0.12em] text-[#54777c]">
              INVENTORY SOURCE OF TRUTH
            </p>

            <p className="text-xs text-[#668b90] mt-1">
              Allocation cannot exceed available stock.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="group flex items-center justify-center gap-2 bg-[#f9b223] text-[#013f46] text-sm font-semibold px-5 py-3 rounded-xl hover:bg-[#ffc44e] transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            <Save
              size={14}
              className={
                saving
                  ? "animate-pulse"
                  : "group-hover:translate-x-0.5 transition-transform"
              }
            />

            {saving
              ? "Saving..."
              : "Save Flash Sale Settings"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FlashSaleSchedule;