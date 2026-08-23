import React from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, Package, ArrowUpRight } from "lucide-react";
import StatusPill from "../common/StatusPill.jsx";

const InventoryCard = ({ item }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/inventory/${item.id}`)}
      className="group relative bg-[#061d21]/95 border border-[#15434a] rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:border-[#28606a] hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(0,0,0,.25)]"
    >
      {/* ============================================================
          IMAGE
      ============================================================ */}

      <div className="relative h-44 bg-[#04181c] overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
        />

        {/* Image overlay */}

        <div className="absolute inset-0 bg-gradient-to-t from-[#04161a] via-transparent to-transparent" />

        {/* Status */}

        <div className="absolute top-3 left-3">
          <StatusPill status={item.status} />
        </div>

        {/* More button */}

        <button
          onClick={(e) => e.stopPropagation()}
          className="absolute top-3 right-3 w-8 h-8 rounded-lg border border-white/10 bg-[#04161a]/75 backdrop-blur-md flex items-center justify-center text-[#a8c4c8] hover:text-white hover:border-[#f9b223]/40 transition-all"
        >
          <MoreVertical size={15} />
        </button>

        {/* Hover arrow */}

        <div className="absolute bottom-3 right-3 w-7 h-7 rounded-lg bg-[#f9b223] text-[#013f46] flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
          <ArrowUpRight size={14} />
        </div>
      </div>

      {/* ============================================================
          CONTENT
      ============================================================ */}

      <div className="p-5">

        {/* SKU */}

        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[8px] tracking-[0.14em] text-[#668b90] truncate">
            {item.sku}
          </p>

          <span className="font-mono text-[8px] tracking-[0.1em] text-[#54777c] shrink-0">
            {item.category}
          </span>
        </div>

        {/* Product name */}

        <h3 className="text-sm font-semibold text-[#e1eeee] mt-2 truncate group-hover:text-[#f9b223] transition-colors">
          {item.name}
        </h3>

        {/* Divider */}

        <div className="h-px bg-[#123a40] mt-4" />

        {/* ========================================================
            STOCK / PRICE
        ======================================================== */}

        <div className="grid grid-cols-2 divide-x divide-[#123a40] mt-4">

          {/* Stock */}

          <div className="pr-4">
            <div className="flex items-center gap-1.5 mb-1">
              <Package
                size={12}
                className="text-[#668b90]"
              />

              <p className="font-mono text-[8px] tracking-[0.12em] text-[#668b90]">
                STOCK
              </p>
            </div>

            <p className="text-lg font-semibold text-[#dcebea]">
              {item.stock}
            </p>

            <p className="font-mono text-[8px] text-[#54777c] mt-0.5">
              UNITS
            </p>
          </div>

          {/* Price */}

          <div className="pl-4 text-right">
            <p className="font-mono text-[8px] tracking-[0.12em] text-[#668b90] mb-1">
              PRICE
            </p>

            <p className="text-lg font-semibold text-[#f9b223]">
              ₹{item.price}
            </p>

            <p className="font-mono text-[8px] text-[#54777c] mt-0.5">
              PER UNIT
            </p>
          </div>
        </div>

        {/* ========================================================
            FOOTER
        ======================================================== */}

        <div className="mt-5 pt-3 border-t border-[#123a40] flex items-center justify-between">
          <p className="font-mono text-[8px] tracking-[0.08em] text-[#54777c]">
            UPDATED
          </p>

          <p className="font-mono text-[8px] text-[#78999e]">
            {item.lastUpdated}
          </p>
        </div>
      </div>

      {/* Bottom accent */}

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-[#f9b223] group-hover:w-1/2 transition-all duration-300" />
    </div>
  );
};

export default InventoryCard;