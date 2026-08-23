import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

const StatCard = ({ label, value, change, trend, isCurrency }) => {
  const isPositive = trend === "up";

  const formattedValue = isCurrency
    ? `₹${value.toLocaleString("en-IN")}`
    : value.toLocaleString("en-IN");

  return (
    <div className="relative bg-[#061d21] rounded-xl border border-[#15434a] p-5 overflow-hidden group transition-all duration-300 hover:border-[#24606a]">
      {/* Top accent line */}
      <div
        className={`absolute top-0 left-0 right-0 h-px ${
          isPositive ? "bg-[#67c987]/40" : "bg-[#e08484]/40"
        }`}
      />

      {/* Subtle background glow */}
      <div
        className={`absolute -right-10 -top-10 w-24 h-24 rounded-full blur-3xl pointer-events-none ${
          isPositive ? "bg-[#67c987]/[0.06]" : "bg-[#e08484]/[0.06]"
        }`}
      />

      {/* Header */}
      <div className="relative flex items-center justify-between">
        <p className="font-mono text-[8px] tracking-[0.16em] uppercase text-[#52777c]">
          {label}
        </p>

        <div
          className={`w-6 h-6 rounded-md flex items-center justify-center border ${
            isPositive
              ? "bg-[#67c987]/[0.06] border-[#67c987]/20"
              : "bg-[#e08484]/[0.06] border-[#e08484]/20"
          }`}
        >
          {isPositive ? (
            <TrendingUp
              size={11}
              className="text-[#67c987]"
            />
          ) : (
            <TrendingDown
              size={11}
              className="text-[#e08484]"
            />
          )}
        </div>
      </div>

      {/* Value + Change */}
      <div className="relative mt-5 flex items-end justify-between gap-3">
        <span className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-[#e7f1f1]">
          {formattedValue}
        </span>

        <span
          className={`flex items-center gap-1 font-mono text-[9px] font-medium pb-1 ${
            isPositive ? "text-[#67c987]" : "text-[#e08484]"
          }`}
        >
          {change}
        </span>
      </div>

      {/* Bottom technical indicator */}
      <div className="relative mt-5 pt-3 border-t border-[#123a40] flex items-center justify-between">
        <span className="font-mono text-[7px] tracking-[0.13em] text-[#405f64]">
          PERFORMANCE
        </span>

        <div className="flex items-center gap-1">
          <span
            className={`w-1 h-1 rounded-full ${
              isPositive ? "bg-[#67c987]" : "bg-[#e08484]"
            }`}
          />

          <span className="font-mono text-[7px] text-[#405f64]">
            {isPositive ? "POSITIVE" : "ATTENTION"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;