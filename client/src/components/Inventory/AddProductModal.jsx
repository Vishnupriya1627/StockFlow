import React, { useState } from "react";
import {
  X,
  PackagePlus,
  ChevronDown,
  AlertTriangle,
  Image as ImageIcon,
} from "lucide-react";

import { createProduct } from "../../api/productApi";
import { categories } from "../../data/mockInventory";

const initialForm = {
  name: "",
  sku: "",
  category: categories[1] || "",
  unitPrice: "",
  currentStock: "",
  reorderThreshold: "10",
  overstockThreshold: "500",
  warehouseLocation: "",
  imageUrl: "",
};

const AddProductModal = ({ isOpen, onClose, onCreated }) => {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        name: form.name,
        sku: form.sku,
        category: form.category,
        unitPrice: Number(form.unitPrice),
        currentStock: Number(form.currentStock),
        reorderThreshold: Number(form.reorderThreshold),
        overstockThreshold: Number(form.overstockThreshold),
        warehouseLocation: form.warehouseLocation || undefined,
        imageUrl: form.imageUrl || undefined,
      };

      const product = await createProduct(payload);

      onCreated(product);
      setForm(initialForm);
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to create product"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full mt-1.5 text-sm border border-[#17444a] rounded-xl px-3.5 py-3 outline-none bg-[#04181c] text-[#d8e8e9] placeholder:text-[#54777c] focus:border-[#f9b223]/60 transition-colors";

  const labelClass =
    "font-mono text-[9px] tracking-[0.14em] text-[#668b90] block";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

      {/* ============================================================
          BACKDROP
      ============================================================ */}

      <div
        className="absolute inset-0 bg-[#020c0f]/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* ============================================================
          MODAL
      ============================================================ */}

      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden border border-[#15434a] bg-[#061d21]/98 backdrop-blur-xl rounded-2xl shadow-[0_30px_100px_rgba(0,0,0,.55)]">

        {/* Top accent line */}

        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f9b223]/70 to-transparent" />

        {/* Subtle background glow */}

        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-[#013f46]/10 via-transparent to-[#f9b223]/[0.02]" />

        {/* ========================================================
            HEADER
        ======================================================== */}

        <div className="relative px-6 lg:px-7 py-5 border-b border-[#123a40] flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-[#f9b223]/10 border border-[#f9b223]/10 flex items-center justify-center">
              <PackagePlus
                size={18}
                className="text-[#f9b223]"
              />
            </div>

            <div>
              <p className="font-mono text-[9px] tracking-[0.16em] text-[#f9b223]">
                INVENTORY CONTROL
              </p>

              <h2 className="text-lg font-semibold text-[#e7f1f1] mt-0.5">
                Add Product
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-[#17444a] bg-[#04181c] flex items-center justify-center text-[#668b90] hover:text-[#d8e8e9] hover:border-[#28606a] transition-all"
          >
            <X size={17} />
          </button>
        </div>

        {/* ========================================================
            FORM
        ======================================================== */}

        <form
          onSubmit={handleSubmit}
          className="relative overflow-y-auto max-h-[calc(90vh-145px)]"
        >
          <div className="p-6 lg:p-7">

            {/* Section label */}

            <div className="flex items-center gap-4 mb-6">
              <span className="font-mono text-[9px] tracking-[0.18em] text-[#668b90]">
                PRODUCT DETAILS
              </span>

              <div className="h-px flex-1 bg-gradient-to-r from-[#19434a] to-transparent" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              {/* ====================================================
                  PRODUCT NAME
              ==================================================== */}

              <div className="sm:col-span-2">
                <label className={labelClass}>
                  PRODUCT NAME
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter product name"
                  className={inputClass}
                />
              </div>

              {/* ====================================================
                  SKU
              ==================================================== */}

              <div>
                <label className={labelClass}>
                  SKU
                </label>

                <input
                  name="sku"
                  value={form.sku}
                  onChange={handleChange}
                  required
                  placeholder="e.g. SF-001"
                  className={inputClass}
                />
              </div>

              {/* ====================================================
                  CATEGORY
              ==================================================== */}

              <div>
                <label className={labelClass}>
                  CATEGORY
                </label>

                <div className="relative">
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className={`${inputClass} appearance-none pr-10`}
                  >
                    {categories
                      .filter((c) => c !== "All")
                      .map((c) => (
                        <option
                          key={c}
                          value={c}
                          className="bg-[#061d21] text-white"
                        >
                          {c}
                        </option>
                      ))}
                  </select>

                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 translate-y-[2px] text-[#6e9095]"
                  />
                </div>
              </div>

              {/* ====================================================
                  UNIT PRICE
              ==================================================== */}

              <div>
                <label className={labelClass}>
                  UNIT PRICE (₹)
                </label>

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="unitPrice"
                  value={form.unitPrice}
                  onChange={handleChange}
                  required
                  placeholder="0.00"
                  className={inputClass}
                />
              </div>

              {/* ====================================================
                  CURRENT STOCK
              ==================================================== */}

              <div>
                <label className={labelClass}>
                  CURRENT STOCK
                </label>

                <input
                  type="number"
                  min="0"
                  name="currentStock"
                  value={form.currentStock}
                  onChange={handleChange}
                  required
                  placeholder="0"
                  className={inputClass}
                />
              </div>

              {/* ====================================================
                  REORDER THRESHOLD
              ==================================================== */}

              <div>
                <label className={labelClass}>
                  REORDER THRESHOLD
                </label>

                <input
                  type="number"
                  min="0"
                  name="reorderThreshold"
                  value={form.reorderThreshold}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              {/* ====================================================
                  OVERSTOCK THRESHOLD
              ==================================================== */}

              <div>
                <label className={labelClass}>
                  OVERSTOCK THRESHOLD
                </label>

                <input
                  type="number"
                  min="0"
                  name="overstockThreshold"
                  value={form.overstockThreshold}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              {/* ====================================================
                  WAREHOUSE
              ==================================================== */}

              <div className="sm:col-span-2">
                <label className={labelClass}>
                  WAREHOUSE LOCATION
                  <span className="text-[#4e7075] ml-1">
                    / OPTIONAL
                  </span>
                </label>

                <input
                  name="warehouseLocation"
                  value={form.warehouseLocation}
                  onChange={handleChange}
                  placeholder="e.g. Warehouse A / Section 04"
                  className={inputClass}
                />
              </div>

              {/* ====================================================
                  IMAGE URL
              ==================================================== */}

              <div className="sm:col-span-2">
                <label className={labelClass}>
                  IMAGE URL
                  <span className="text-[#4e7075] ml-1">
                    / OPTIONAL
                  </span>
                </label>

                <input
                  type="url"
                  name="imageUrl"
                  value={form.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/product.jpg"
                  className={inputClass}
                />

                {/* Image Preview */}

                {form.imageUrl && (
                  <div className="mt-3 flex items-center gap-3 border border-[#17444a] bg-[#04181c] rounded-xl p-3">

                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-[#17444a] bg-[#061d21] flex items-center justify-center shrink-0">
                      <img
                        src={form.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />

                      <ImageIcon
                        size={17}
                        className="text-[#54777c]"
                      />
                    </div>

                    <div>
                      <p className="font-mono text-[8px] tracking-[0.12em] text-[#66b47e]">
                        IMAGE PREVIEW
                      </p>

                      <p className="text-xs text-[#6e9095] mt-1">
                        Product image loaded from the provided URL.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

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
                    PRODUCT CREATION ERROR
                  </p>

                  <p className="text-sm text-[#b78b8b] mt-1">
                    {error}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================
              FOOTER
          ======================================================== */}

          <div className="sticky bottom-0 px-6 lg:px-7 py-4 border-t border-[#123a40] bg-[#061d21]/98 backdrop-blur-xl flex items-center justify-between gap-3">

            <span className="hidden sm:block font-mono text-[8px] tracking-[0.12em] text-[#54777c]">
              STOCKFLOW / PRODUCT REGISTRY
            </span>

            <div className="flex items-center gap-3 ml-auto">

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-medium text-[#8eafb3] border border-[#17444a] bg-[#04181c] rounded-xl hover:text-[#d8e8e9] hover:border-[#28606a] transition-all"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="group flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-[#f9b223] text-[#013f46] rounded-xl hover:bg-[#ffc44e] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PackagePlus
                  size={15}
                  className={
                    submitting
                      ? "animate-pulse"
                      : "group-hover:scale-105 transition-transform"
                  }
                />

                {submitting
                  ? "Creating..."
                  : "Create Product"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;